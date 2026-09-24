import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { EstadisticasResponse } from "../../models/statistics.model";
import { API_URL } from "./api";


@Injectable({
    providedIn: 'root'
})
export class StatisticsService {

    private http = inject(HttpClient);

    private apiUrl = `${API_URL}/estadisticas`;


    obtenerEstadisticas(
        mes: number,
        anio: number
    ) {

        return this.http.get<EstadisticasResponse>(
            this.apiUrl,
            {
                params: {
                    mes,
                    anio
                }
            }
        );
    }

}