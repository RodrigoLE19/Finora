import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { ActualizarGastoRecurrenteRequest, CrearGastoRecurrenteRequest, EliminarGastoRecurrenteResponse, GastoRecurrenteResponse, GastosRecurrentesResponse } from "../../models/recurring-expense.model";



@Injectable({
    providedIn: 'root'
})
export class RecurringExpenseService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/gastos-recurrentes';

    obtenerGastosRecurrentes() {
        return this.http.get<GastosRecurrentesResponse>(this.apiUrl);
    }

    crearGastoRecurrente(
        datos: CrearGastoRecurrenteRequest
    ) {
        return this.http.post<GastoRecurrenteResponse>(this.apiUrl, datos);
    }

    actualizarGastoRecurrente(
        idGastoRecurrente: number,
        datos: ActualizarGastoRecurrenteRequest
    ) {
        return this.http.put<GastoRecurrenteResponse>(
            `${this.apiUrl}/${idGastoRecurrente}`,
            datos
        );
    }

    eliminarGastoRecurrente(
        idGastoRecurrente: number
    ) {
        return this.http.delete<EliminarGastoRecurrenteResponse>(
            `${this.apiUrl}/${idGastoRecurrente}`
        );
    }

}