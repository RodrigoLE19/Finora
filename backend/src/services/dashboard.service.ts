import { pool } from "../config/database"


export const getFinancialSummary = async  (
    idUsuario: number,
    mes: number,
    anio: number
) => {

    const movimientosResult = await pool.query(
        `SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'INGRESO' THEN monto
                        WHEN tipo = 'GASTO' THEN -monto
                        ELSE 0
                    END
                    ),
                    0
                ) AS saldo_actual,
                 
                COALESCE(
                    SUM(
                        CASE
                            WHEN tipo = 'INGRESO'
                                AND EXTRACT(MONTH FROM fecha) = $2
                                AND EXTRACT(YEAR FROM fecha) = $3
                            THEN monto
                            ELSE 0
                        END
                    ),
                    0
                ) AS ingreso_mes,
                 
                COALESCE(
                    SUM(
                        CASE
                            WHEN tipo = 'GASTO'
                                AND EXTRACT(MONTH FROM fecha) = $2
                                AND EXTRACT(YEAR FROM fecha) = $3
                            THEN monto
                            ELSE 0
                        END
                    ),
                    0
                ) AS gasto_mes
                
                FROM movimientos
                WHERE id_usuario = $1`,
                [
                    idUsuario,
                    mes,
                    anio
                ]
    );

    const recurrentesResult = await pool.query(
        `SELECT
            COALESCE(SUM(gr.monto), 0) AS dinero_comprometido
        FROM gastos_recurrentes gr
        WHERE gr.id_usuario = $1
            AND gr.activo = TRUE
            AND NOT EXISTS (
                SELECT 1
                FROM movimientos m
                WHERE m.id_usuario = gr.id_usuario
                    AND m.id_gasto_recurrente = gr.id_gasto_recurrente
                    AND m.tipo = 'GASTO'
                    AND EXTRACT(MONTH FROM m.fecha) = $2
                    AND EXTRACT(YEAR FROM m.fecha) = $3
            )`,
            [
                idUsuario,
                mes,
                anio
            ]
    );

    const resumenMovimientos = movimientosResult.rows[0];

    const saldoActual = Number(resumenMovimientos.saldo_actual);
    const dineroComprometido =
        Number(recurrentesResult.rows[0].dinero_comprometido);

    const disponibleReal = saldoActual - dineroComprometido;

    return {
        saldo_actual: saldoActual.toFixed(2),
        ingresos_mes: Number(resumenMovimientos.ingreso_mes).toFixed(2),
        gastos_mes: Number(resumenMovimientos.gasto_mes).toFixed(2),
        dinero_comprometido: dineroComprometido.toFixed(2),
        disponible_real: disponibleReal.toFixed(2)
    };
}

export const getMonthlyComparison = async (
    idUsuario: number,
    mes: number,
    anio: number
) => {

    let mesAnterior = mes -1;
    let anioAnterior = anio;

    if (mesAnterior === 0) {
        mesAnterior = 12;
        anioAnterior = anio - 1;
    }
    const resultado = await pool.query(
        `SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'GASTO'
                            AND EXTRACT(MONTH FROM fecha) = $2
                            AND EXTRACT(YEAR FROM fecha) = $3
                        THEN monto
                        ELSE 0
                    END
                    ),
                    0
                ) AS gastos_actual,
                 
                COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'GASTO'
                            AND EXTRACT(MONTH FROM fecha) = $4
                            AND EXTRACT(YEAR FROM fecha) = $5
                        THEN monto
                        ELSE 0
                    END
                    ),
                    0
                ) AS gastos_anterior
            FROM movimientos
            WHERE id_usuario = $1`,
            [
                idUsuario,
                mes,
                anio,
                mesAnterior,
                anioAnterior
            ]
    );

    const gastosActual = Number(resultado.rows[0].gastos_actual);
    const gastosAnterior = Number(resultado.rows[0].gastos_anterior);

    let porcentajeCambio = 0;

    if (gastosAnterior > 0) {
        porcentajeCambio =
            ((gastosActual - gastosAnterior) / gastosAnterior) * 100;
    }

    return {
        mes_actual: {
            mes,
            anio,
            gastos: gastosActual.toFixed(2)
        },
        mes_anterior: {
            mes: mesAnterior,
            anio: anioAnterior,
            gastos: gastosAnterior.toFixed(2)
        },
        porcentaje_cambio: porcentajeCambio.toFixed(2)
    };
};

export const getRecentMovements = async (
    idUsuario: number
) => {

    const resultado = await pool.query(
        `SELECT
            m.id_movimiento,
            m.tipo,
            m.monto,
            m.descripcion,
            m.fecha,
            c.nombre AS categoria
        FROM movimientos m
        INNER JOIN categorias c
            ON m.id_categoria = c.id_categoria
        WHERE m.id_usuario = $1
        ORDER BY m.fecha DESC, m.id_movimiento DESC
        LIMIT 5`,
        [idUsuario]
    );

    return resultado.rows;
};

export const getExpenseDistribution = async (
    idUsuario: number,
    mes: number,
    anio: number
) => {

    const resultado = await pool.query(
        `SELECT
            c.nombre AS categoria,
            COALESCE(SUM(m.monto), 0) AS total
        FROM movimientos m
        INNER JOIN categorias c
            ON m.id_categoria = c.id_categoria
        WHERE m.id_usuario = $1
            AND m.tipo = 'GASTO'
            AND EXTRACT(MONTH FROM m.fecha) = $2
            AND EXTRACT(YEAR FROM m.fecha) = $3
        GROUP BY c.id_categoria, c.nombre
        ORDER BY total DESC`,
        [
            idUsuario,
            mes,
            anio
        ]

    );

    return resultado.rows;
}