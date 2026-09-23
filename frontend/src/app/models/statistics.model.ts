export interface EvolucionMensual {
    anio: number;
    mes: number;
    ingresos: string;
    gastos: string;
}

export interface IngresosVsGastos {
    ingresos: string;
    gastos: string;
}

export interface GastoPorCategoria {
    categoria: string;
    total: string;
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

export interface EstadisticasResponse {
    evolucionMensual: EvolucionMensual[];
    ingresosVsGastos: IngresosVsGastos;
    gastosPorCategoria: GastoPorCategoria[];
    comparacionMensual: ComparacionMensual;
}