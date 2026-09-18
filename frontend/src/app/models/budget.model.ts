export interface Presupuesto {
    id_presupuesto: number;
    id_categoria: number;
    categoria: string;
    monto_limite:string;
    gastado: string;
    disponible: string;
    porcentaje_usado: string;
    mes: number;
    anio: number;
}

export interface PresupuestosResponse {
    presupuestos: Presupuesto[];
}