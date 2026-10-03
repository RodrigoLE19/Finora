import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { AuthService } from "../services/auth.service";
import { API_URL } from "../services/api";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";

export const authInterceptor: HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const router = inject(Router);

    const  token = authService.obtenerToken();

    const esPeticionAPI = req.url.startsWith(`${API_URL}/`);

    const esPeticionAcceso =
        req.url === `${API_URL}/auth/login` ||
        req.url === `${API_URL}/auth/register`;
    
    if (!token || !esPeticionAPI || esPeticionAcceso) {
        return next(req);
    }

    const authRequest = req.clone({
        setHeaders: {
            Authorization: `Bearer ${token}`
        }
    });

    return next(authRequest).pipe(
        catchError((error: HttpErrorResponse) => {
            if (
                error.status === 401 &&
                authService.obtenerToken() === token
            ) {
                authService.cerrarSesion();

                void router.navigate(['/login'], {
                    queryParams: {motivo: 'sesion-expirada'}
                });
            }

            return throwError(() => error);
        })
    );
}