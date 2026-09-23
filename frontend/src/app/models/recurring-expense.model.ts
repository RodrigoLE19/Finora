export interface GastoRecurrente {
    id_gasto_recurrente: number;
    id_categoria: number;
    categoria: string;
    descripcion: string;
    monto: string;
    frecuencia: string;
    dia_pago: number;
    activo: boolean;
    fecha_creacion: string;
}

export interface GastosRecurrentesResponse {
    gastosRecurrentes: GastoRecurrente[];
}

export interface CrearGastoRecurrenteRequest {
    idCategoria: number;
    descripcion: string;
    monto: number;
    frecuencia: string;
    diaPago: number;
}

export interface ActualizarGastoRecurrenteRequest {
    idCategoria: number;
    descripcion: string;
    monto: number;
    frecuencia: string;
    diaPago: number;
    activo: boolean;
}

export interface GastoRecurrenteGuardado {
    id_gasto_recurrente: number;
    id_usuario: number;
    id_categoria: number;
    descripcion: string;
    monto: string;
    frecuencia: string;
    dia_pago: number;
    activo: boolean;
    fecha_creacion: string;
}

export interface GastoRecurrenteResponse {
    message: string;
    gastoRecurrente: GastoRecurrenteGuardado;
}

export interface EliminarGastoRecurrenteResponse {
    message: string;
}