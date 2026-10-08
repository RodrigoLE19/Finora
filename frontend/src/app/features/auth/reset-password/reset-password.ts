import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  private token =
    this.route.snapshot.queryParamMap.get('token') ?? '';

  tokenPresente = /^[a-f0-9]{64}$/.test(this.token);

  guardando = signal(false);
  completado = signal(false);
  mostrarPassword = signal(false);
  error = signal('');

  formulario = this.fb.nonNullable.group({
    password: ['', [
      Validators.required,
      Validators.minLength(6)
    ]],
    confirmacion: ['', Validators.required]
  });

  cambiarPassword(): void {
    if (this.guardando() || this.completado()) {
      return;
    }

    this.error.set('');

    if (!this.tokenPresente) {
      this.error.set('El enlace es inválido. Solicita uno nuevo.');
      return;
    }

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const { password, confirmacion } =
      this.formulario.getRawValue();

    if (password !== confirmacion) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      this.error.set(
        'La contraseña es demasiado larga. Usa una más corta.'
      );
      return;
    }

    this.guardando.set(true);

    this.authService.restablecerPassword(this.token, password)
      .pipe(
        finalize(() => this.guardando.set(false))
      )
      .subscribe({
        next: () => {
          this.completado.set(true);
          this.formulario.reset();

          this.authService.cerrarSesion();

          window.history.replaceState(
            window.history.state,
            '',
            window.location.pathname
          );
        },
        error: (respuesta) => {
          this.error.set(
            respuesta.error?.message ||
            'No se pudo actualizar la contraseña. Inténtalo nuevamente.'
          );
        }
      });
  }
}