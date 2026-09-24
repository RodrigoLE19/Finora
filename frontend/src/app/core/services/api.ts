import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

export const API_URL = 'https://finora-backend-bu19.onrender.com/api';

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
