import { Dashboard } from "../features/dashboard/dashboard";

export interface DashboardResumen {
    saldo_actual: string;
    ingresos_mes: string;
    gastos_mes: string;
    dinero_comprometido: string;
    disponible_real: string;
}

export interface MesComparacion {
    mes: number;
    anio: number;
    gastos: string;
}

export interface ComparacionMensual {
    mes_actual: MesComparacion;
    mes_anterior: MesComparacion;
    porcentaje_cambio: string;
}

export interface MovimientoReciente {
    id_movimiento: number,
    tipo: 'INGRESO' | 'GASTO';
    monto: string;
    descripcion: string;
    fecha: string;
    categoria: string;
}

export interface DistribucionGasto {
    categoria: string;
    total: string;
}

export interface DashboardResponse {
    resumen: DashboardResumen;
    comparacion: ComparacionMensual;
    movimientosRecientes: MovimientoReciente[];
    distribucionGastos: DistribucionGasto[];
}