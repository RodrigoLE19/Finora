import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = this.authService.obtenerUsuario();

  menuAbierto = signal(false);

  get inicialUsuario(): string {
    return this.usuario?.nombre?.charAt(0).toUpperCase() ?? 'U';
  }

  abrirMenu() {
    this.menuAbierto.set(true);
  }

  cerrarMenu() {
    this.menuAbierto.set(false);
  }

  cerrarSesion() {
    this.cerrarMenu();
    this.authService.cerrarSesion();
    this.router.navigate(['/login']);
  }
}
