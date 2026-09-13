import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/services/api';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private api = inject(Api);

  mensajeApi = signal('Comprobando conexion...');

  ngOnInit() {
    this.api.verificarApi().subscribe({
      next: (response) => {
        this.mensajeApi.set(response.message);
      },
      error: (error) => {
        console.error('Error al conectar con la API:', error);
        this.mensajeApi.set('No se pudo conectar con la API');
      }
    });
  }
}
