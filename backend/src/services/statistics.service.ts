import { pool } from "../config/database"


export const getMonthlyEvolution = async (
    idUsuario: number
) => {

    const resultado = await pool.query(
        `SELECT
            EXTRACT(YEAR FROM fecha)::INTEGER AS anio,
            EXTRACT(MONTH FROM fecha)::INTEGER AS mes,
            
            COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'INGRESO' THEN monto
                        ELSE 0
                    END
                    ),
                    0
                ) AS ingresos,
                 
            COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'GASTO' THEN monto
                        ELSE 0
                    END
                    ),
                    0
                ) AS gastos
            
            FROM movimientos
            WHERE id_usuario = $1
            
            GROUP BY
                EXTRACT(YEAR FROM fecha),
                EXTRACT(MONTH FROM fecha)
            
            ORDER BY
                anio DESC,
                mes DESC
                
            LIMIT 6`,
            [idUsuario]
    );

    return resultado.rows.reverse();
}

export const getIncomeVsExpenses = async (
    idUsuario: number,
    mes: number,
    anio: number
) => {

    const resultado = await pool.query(
        `SELECT
            COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'INGRESO' THEN monto
                        ELSE 0
                    END
                ),
                0
            ) AS ingresos,
             
            COALESCE(
                SUM(
                    CASE
                        WHEN tipo = 'GASTO' THEN monto
                        ELSE 0
                    END
                ),
                0
            ) AS gastos
            
            FROM movimientos
            WHERE id_usuario = $1
                AND EXTRACT(MONTH FROM fecha) = $2
                AND EXTRACT(YEAR FROM fecha) = $3`,
            [
                idUsuario,
                mes,
                anio
            ]
    );

    return resultado.rows[0];
}

export const getExpensesByCategory = async (
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