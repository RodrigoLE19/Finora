import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { 
    ActualizarMovimientoRequest,
    CrearMovimientoRequest,
    MovimientoResponse,
    MovimientosResponse,

 } from "../../models/movement.model";
import { API_URL } from "./api";


@Injectable({
    providedIn: 'root'
})
export class MovementService {

    private http = inject(HttpClient);
    private apiUrl = `${API_URL}/movimientos`;

    obtenerMovimientos() {
        return this.http.get<MovimientosResponse>(
            this.apiUrl
        );
    }

    crearMovimiento(datos: CrearMovimientoRequest) {
        return this.http.post<MovimientoResponse>(
            this.apiUrl,
            datos
        );
    }

    actualizarMovimiento(
        idMovimiento: number,
        datos: ActualizarMovimientoRequest
    ) {
        return this.http.put<MovimientoResponse>(
            `${this.apiUrl}/${idMovimiento}`,
            datos
        );
    }

    eliminarMovimientos(idMovimiento: number) {
        return this.http.delete(
            `${this.apiUrl}/${idMovimiento}`
        );
    }
}