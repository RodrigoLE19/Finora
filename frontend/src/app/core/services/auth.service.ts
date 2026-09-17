import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, Usuario } from "../../models/auth.model";


@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private http = inject(HttpClient);

    private apiURL = 'http://localhost:3000/api/auth';

    login(data: LoginRequest) {
        return this.http.post<LoginResponse>(`${this.apiURL}/login`, data);
    }

    register(data: RegisterRequest) {
        return this.http.post<RegisterResponse>(`${this.apiURL}/register`,data);
    }

    guardarSesion(response: LoginResponse) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('usuario', JSON.stringify(response.usuario));
    }

    obtenerToken(){
        return localStorage.getItem('token');
    }

    obtenerUsuario(): Usuario | null {
        const usuario = localStorage.getItem('usuario');

        if (!usuario) {
            return null;
        }


        return JSON.parse(usuario);
    }

    cerrarSesion() {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
    }

    estaAutenticado(){
        return !!this.obtenerToken();
    }

}