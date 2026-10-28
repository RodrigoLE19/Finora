import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.tokenVigente()) {
        const teniaToken = !!authService.obtenerToken();

        authService.cerrarSesion();

        return router.createUrlTree(['/login'], {
            queryParams: teniaToken
                ? { motivo: 'sesion-expirada' }
                : {}
        });
    }

    if (authService.obtenerUsuario()) {
        return true;
    }

    return authService.cargarPerfil().pipe(
        map(() => true),

        catchError(error => {
            if (error.status === 401) {
            
                return of(
                    router.createUrlTree(['/login'], {
                        queryParams: {
                            motivo: 'sesion-expirada'
                        }
                    })
                );
            }

            return of(
                router.createUrlTree(['/login'], {
                    queryParams: {
                        motivo: 'perfil-no-disponible'
                    }
                })
            );
        })
    );
};