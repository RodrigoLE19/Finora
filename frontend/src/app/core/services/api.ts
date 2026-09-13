import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);

  private apiUrl = `http://localhost:3000/api`;

  verificarApi() {
    return this.http.get<{
      status: string;
      message: string;
    }>(`${this.apiUrl}/health`);
  }
}
