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
    fecha_creacion: string;
}

export interface PresupuestosResponse {
    presupuestos: Presupuesto[];
}

export interface CrearPresupuestoRequest {
    idCategoria: number;
    montoLimite: number;
    mes: number;
    anio: number;
}

export interface ActualizarPresupuestoRequest {
    idCategoria: number;
    montoLimite: number;
    mes: number;
    anio: number;
}

export interface PresupuestoGuardado {
    id_presupuesto: number;
    id_usuario: number;
    id_categoria: number;
    monto_limite:string;
    mes: number;
    anio: number;
    fecha_creacion: string;
}

export interface PresupuestoResponse {
    message: string;
    presupuesto: PresupuestoGuardado;
}

export interface EliminarPresupuestoResponse {
    message: string;
}