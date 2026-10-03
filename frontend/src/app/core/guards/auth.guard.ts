import { inject } from "@angular/core";
import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";



export const authGuard: CanActivateFn = () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.tokenVigente()) {
        return true;
    }

    const teniaToken = !!authService.obtenerToken();

    authService.cerrarSesion();

    return router.createUrlTree(['/login'], {
        queryParams: teniaToken
            ? { motivo: 'sesion-expirada' }
            : {}
    });
}