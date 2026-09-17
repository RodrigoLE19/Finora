import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);

  showPassword = signal(false);
  showConfirmPassword = signal(false);

  registerForm = this.formBuilder.nonNullable.group({
    nombre: ['', [
      Validators.required,
      Validators.minLength(3)
    ]],

    email: ['', [
      Validators.required,
      Validators.email
    ]],

    password: ['', [
      Validators.required,
      Validators.minLength(8)
    ]],

    confirmPassword: ['', [
      Validators.required,
    ]]
  });

  togglePassword() {
    this.showPassword.update(valor => !valor);
  }

  toggleConfirmPassword() {
    this.showConfirmPassword.update(valor => !valor);
  }

  passwordsCoinciden() {
    const password = this.registerForm.controls.password.value;
    const confirmPassword = this.registerForm.controls.confirmPassword.value;

    return (
      password.length > 0 &&
      confirmPassword.length > 0 &&
      password === confirmPassword
    );
  }

  seguridadPassword() {
    const password = this.registerForm.controls.password.value;

    let nivel = 0;

    if (password.length >= 8) nivel++;
    if (/[A-Z]/.test(password)) nivel++;
    if (/[0-9]/.test(password)) nivel++;
    if (/[^A-Za-z0-9]/.test(password)) nivel++;

    return nivel;
  }

  crearCuenta() {

    const formulario = this.registerForm.getRawValue();

    const faltantes: string[] = [];

    if (!formulario.nombre.trim()) {
      faltantes.push('nombre completo');
    }

    if (!formulario.email.trim()) {
      faltantes.push('correo electrónico');
    }

    if (!formulario.password) {
      faltantes.push('contraseña');
    }

    if (!formulario.confirmPassword) {
      faltantes.push('confirmar contraseña');
    }

    if (faltantes.length === 4) {

      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa todos los campos para crear tu cuenta.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    if (faltantes.length > 0) {

      let mensaje = '';

      if (faltantes.length === 1) {

        mensaje = `Falta completar: ${faltantes[0]}.`;

      } else {

        const ultimoCampo = faltantes[faltantes.length - 1];
        const otrosCampos = faltantes.slice(0, -1).join(', ');

        mensaje =
          `Falta completar: ${otrosCampos} y ${ultimoCampo}.`;
      }

      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: mensaje,
        confirmButtonText: 'Entendido'
      });

      return;
    }

    if (formulario.nombre.trim().length < 3) {

      Swal.fire({
        icon: 'warning',
        title: 'Nombre no válido',
        text: 'Ingresa un nombre válido.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    if (this.registerForm.controls.email.invalid) {

      Swal.fire({
        icon: 'warning',
        title: 'Correo no válido',
        text: 'Ingresa un correo electrónico válido.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    if (formulario.password.length < 8) {

      Swal.fire({
        icon: 'warning',
        title: 'Contraseña muy corta',
        text: 'La contraseña debe tener al menos 8 caracteres.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    if (formulario.password !== formulario.confirmPassword) {

      Swal.fire({
        icon: 'warning',
        title: 'Las contraseñas no coinciden',
        text: 'Verifica ambas contraseñas.',
        confirmButtonText: 'Entendido'
      });

      return;
    }

    this.isLoading.set(true);

    const datos = {
      nombre: formulario.nombre.trim(),
      email: formulario.email.trim(),
      password: formulario.password
    };

    this.authService.register(datos).subscribe({

      next: () => {

        this.isLoading.set(false);

        Swal.fire({
          icon: 'success',
          title: 'Cuenta creada',
          text: 'Tu cuenta fue creada correctamente.',
          confirmButtonText: 'Iniciar sesión'
        }).then(() => {

          this.router.navigate(['/login']);

        });
      },

      error: (error) => {

        this.isLoading.set(false);

        if (error.status === 409) {

          Swal.fire({
            icon: 'warning',
            title: 'Correo registrado',
            text: 'Ya existe una cuenta con este correo electrónico.',
            confirmButtonText: 'Entendido'
          });

        } else {

          Swal.fire({
            icon: 'error',
            title: 'No se pudo crear la cuenta',
            text: 'Inténtalo nuevamente.',
            confirmButtonText: 'Entendido'
          });

        }
      }
    });
  }
}
