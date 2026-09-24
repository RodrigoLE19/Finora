import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DashboardResponse } from '../../models/dashboard.model';
import { API_URL } from "./api";

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private http = inject(HttpClient);
    private apiUrl = `${API_URL}/dashboard`;

    obtenerResumen(mes: number, anio: number) {
        return this.http.get<DashboardResponse>(
            `${this.apiUrl}/resumen`,
            {
                params: {
                    mes,
                    anio
                }
            }
        );
    }
}