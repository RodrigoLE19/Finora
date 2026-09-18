import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { PresupuestosResponse } from "../../models/budget.model";


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
        )
    }

}