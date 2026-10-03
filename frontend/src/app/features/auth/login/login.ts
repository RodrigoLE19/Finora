import { Component, inject, signal, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  loginForm = this.formBuilder.nonNullable.group({
    email: ['', [
      Validators.required,
      Validators.email
    ]],

    password: ['', [
      Validators.required
    ]]
  });

  ngOnInit(): void {
    const motivo =  this.route.snapshot.queryParamMap.get('motivo');

    if (motivo === 'sesion-expirada') {
      Swal.fire({
        icon: 'info',
        title: 'Tu sesión ha expirado',
        text: 'Inicia sesión nuevamente para continuar.'
      });

      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { motivo: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }
  }
  togglePassword() {
    this.showPassword.update(valor => !valor);
  }

  iniciarSesion() {

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      this.errorMessage.set(
        'Completa correctamente el correo y la contraseña'
      );

      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const datos = this.loginForm.getRawValue();

    this.authService.login(datos).subscribe({

      next: (response) => {

        this.authService.guardarSesion(response);

        this.isLoading.set(false);

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Inicio de sesión correcto',
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true
        });

        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        this.isLoading.set(false);

        if (error.status === 401) {

          Swal.fire({
            icon: 'error',
            title: 'No se pudo iniciar sesión',
            text: 'Correo o contraseña incorrectos'
          });

        } else {

          Swal.fire({
            icon: 'error',
            title: 'Ocurrió un problema',
            text: 'No se pudo iniciar sesión. Inténtalo nuevamente.'
          });

        }
      }
    });
  }
}