import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export const API_URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private http = inject(HttpClient);

  verificarApi() {
    return this.http.get<{
      status: string;
      message: string;
    }>(`${API_URL}/health`);
  }
}
