import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, Usuario } from "../../models/auth.model";
import { API_URL } from "./api";
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private http = inject(HttpClient);

    private apiURL = `${API_URL}/auth`;

    private usuarioActual = signal<Usuario | null>(null);

    cargarPerfil() {
        const tokenSolicitado = this.obtenerToken();

        return this.http.get<{
            message: string;
            usuario: Usuario;
        }>(`${this.apiURL}/me`).pipe(
            tap(response => {
                if (this.obtenerToken() === tokenSolicitado) {
                    this.usuarioActual.set(response.usuario);
                }
            })
        );
    }

    login(data: LoginRequest) {
        return this.http.post<LoginResponse>(`${this.apiURL}/login`, data);
    }

    register(data: RegisterRequest) {
        return this.http.post<RegisterResponse>(`${this.apiURL}/register`,data);
    }

    guardarSesion(response: LoginResponse) {
        localStorage.setItem('token', response.token);
        localStorage.removeItem('usuario');

        this.usuarioActual.set(response.usuario);
    }

    obtenerToken(){
        return localStorage.getItem('token');
    }

    obtenerUsuario(): Usuario | null {
        return this.usuarioActual();
    }

    cerrarSesion() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');

        this.usuarioActual.set(null);
    }

    estaAutenticado(){
        return !!this.obtenerToken();
    }

    tokenVigente(): boolean {
        const token = this.obtenerToken();

        if (!token) {
            return false;
        }

        try {
            const partes = token.split('.');

            if (partes.length !== 3) {
                return false;
            }

            const base64 = partes[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const contenido = base64.padEnd(
                Math.ceil(base64.length / 4) * 4,
                '='
            );

            const payload = JSON.parse(atob(contenido));
            const ahora = Date.now() / 1000;

            return (
                typeof payload.exp === 'number' &&
                Number.isFinite(payload.exp) &&
                payload.exp > ahora 
            );
        } catch {
            return false;
        }
    }

    solicitarRecuperacion(email: string) {
        return this.http.post<{message: string}>(
            `${this.apiURL}/forgot-password`,
            {email}
        );
    }

    restablecerPassword(token: string, password: string) {
        return this.http.post<{message: string}>(
            `${this.apiURL}/reset-password`,
            {token, password}
        );
    }

}