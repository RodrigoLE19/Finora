import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { DashboardResponse } from '../../models/dashboard.model';


@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/dashboard';

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