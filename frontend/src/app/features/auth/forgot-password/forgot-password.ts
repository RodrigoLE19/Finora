import { Component, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  enviando = signal(false);
  mensaje = signal('');
  error = signal('');

  formulario = this.fb.nonNullable.group({
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(254)
      ]
    ]
  });

  enviarEnlace(): void {
    if (this.enviando()) {
      return;
    }

    this.mensaje.set('');
    this.error.set('');

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);

    const email = this.formulario.controls.email.value
      .trim()
      .toLowerCase();

    this.authService.solicitarRecuperacion(email)
      .pipe(
        finalize(() => this.enviando.set(false))
      )
      .subscribe({
        next: (respuesta) => {
          this.mensaje.set(respuesta.message);
        },
        error: (respuesta) => {
          this.error.set(
            respuesta.error?.message ||
            'No se pudo enviar la solicitud. Inténtalo nuevamente.'
          );
        }
      });
  }
}