import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { 
    ActualizarPresupuestoRequest,
    CrearPresupuestoRequest,
    EliminarPresupuestoResponse,
    PresupuestoResponse,
    PresupuestosResponse 
} from "../../models/budget.model";


@Injectable({
    providedIn: 'root'
})
export class BudgetService {

    private http = inject(HttpClient);
    private apiUrl = 'http://localhost:3000/api/presupuestos';

    obtenerPresupuestos(mes: number, anio: number) {

        return this.http.get<PresupuestosResponse>(
            this.apiUrl,
            {
                params: {
                    mes,
                    anio
                }
            }
        );
    }

    crearPresupuesto(datos: CrearPresupuestoRequest) {
        return this.http.post<PresupuestoResponse>(
            this.apiUrl,
            datos
        );
    }

    actualizarPresupuesto(idPresupuesto: number, datos: ActualizarPresupuestoRequest) {
        return this.http.put<PresupuestoResponse>(
            `${this.apiUrl}/${idPresupuesto}`, datos
        );
    }

    eliminarPresupuesto(idPresupuesto: number) {
        return this.http.delete<EliminarPresupuestoResponse>(
            `${this.apiUrl}/${idPresupuesto}`
        );
    }

}