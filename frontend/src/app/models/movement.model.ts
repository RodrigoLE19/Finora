export interface Movimiento {
    id_movimiento: number;
    id_categoria: number;
    categoria: string;
    tipo: 'INGRESO' | 'GASTO';
    monto: string;
    descripcion: string;
    fecha: string;
    fecha_creacion: string;
}

export interface MovimientosResponse {
  movimientos: Movimiento[];
}

export interface CrearMovimientoRequest {
  idCategoria: number;
  tipo: 'INGRESO' | 'GASTO';
  monto: number;
  descripcion: string | null;
  fecha: string;
  idGastoRecurrente?: number | null;
}

export interface ActualizarMovimientoRequest {
  idCategoria: number;
  tipo: 'INGRESO' | 'GASTO';
  monto: number;
  descripcion: string | null;
  fecha: string;
}

export interface MovimientoResponse {
  message: string;
  movimiento: Movimiento;
}

