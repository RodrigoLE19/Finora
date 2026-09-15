import { pool } from "../config/database"


export const createBudget = async (
    idUsuario: number,
    idCategoria: number,
    montoLimite: number,
    mes: number,
    anio: number
) => {

    const categoriaResult = await pool.query(
        `SELECT id_categoria, tipo 
        FROM categorias
        WHERE id_categoria = $1`,
        [idCategoria]
    );

    if (categoriaResult.rows.length === 0) {
        throw new Error('CATEGORY_NOT_FOUND');
    }

    const categoria = categoriaResult.rows[0];

    if (categoria.tipo !== 'GASTO') {
        throw new Error('CATEGORY_MUST_BE_EXPENSE');
    }

    const resultado = await pool.query(
        `INSERT INTO presupuestos
            (id_usuario, id_categoria, monto_limite, mes, anio)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id_presupuesto,
            id_usuario,
            id_categoria,
            monto_limite,
            mes,
            anio,
            fecha_creacion`,
        [
            idUsuario,
            idCategoria,
            montoLimite,
            mes,
            anio
        ]
    );

    return resultado.rows[0];
}

export const getBudgetsByUser = async (
    idUsuario: number,
    mes: number,
    anio: number
) => {

    const resultado = await pool.query(
        `SELECT
            p.id_presupuesto,
            p.id_categoria,
            c.nombre AS categoria,
            p.monto_limite,

            COALESCE(SUM(m.monto), 0) AS gastado,

            p.monto_limite - COALESCE(SUM(m.monto), 0) AS disponible,
            ROUND (
                (COALESCE(SUM(m.monto), 0) / p.monto_limite) * 100,
                2
            ) AS porcentaje_usado,

            p.mes,
            p.anio,
            p.fecha_creacion

        FROM presupuestos p

        INNER JOIN categorias c
            ON p.id_categoria = c.id_categoria

        LEFT JOIN movimientos m
            ON m.id_usuario = p.id_usuario
            AND m.id_categoria = p.id_categoria
            AND m.tipo = 'GASTO'
            AND EXTRACT(MONTH FROM m.fecha) = p.mes
            AND EXTRACT(YEAR FROM m.fecha) = p.anio

        WHERE p.id_usuario = $1
            AND p.mes = $2
            AND p.anio = $3

        GROUP BY
            p.id_presupuesto, 
            c.nombre
            
        ORDER BY c.nombre`,
    [
        idUsuario,
        mes,
        anio
    ]
    );

    return resultado.rows;
}

export const updateBudget = async (
    idPresupuesto: number,
    idUsuario: number,
    idCategoria: number,
    montoLimite: number,
    mes: number,
    anio: number
) => {

    const categoriaResult = await pool.query(
        `SELECT id_categoria, tipo
        FROM categorias
        WHERE id_categoria = $1`,
        [idCategoria]
    );

    if (categoriaResult.rows.length === 0) {
        throw new Error('CATEGORY_NOT_FOUND');
    }

    const categoria = categoriaResult.rows[0];

    if (categoria.tipo !== 'GASTO') {
        throw new Error('CATEGORY_MUST_BE_EXPENSE');
    }

    const resultado = await pool.query(
        `UPDATE presupuestos
        SET
            id_categoria = $1,
            monto_limite = $2,
            mes = $3,
            anio = $4
        WHERE id_presupuesto = $5
            AND id_usuario = $6
        RETURNING
            id_presupuesto,
            id_usuario,
            id_categoria,
            monto_limite,
            mes,
            anio,
            fecha_creacion`,
            [
                idCategoria,
                montoLimite,
                mes,
                anio,
                idPresupuesto,
                idUsuario
            ]
    );

    if (resultado.rows.length === 0) {
        throw new Error('BUFGET_NOT_FOUND');
    }

    return resultado.rows[0];
}

export const deleteBudget = async (
    idPresupuesto: number,
    idUsuario: number
) => {

    const resultado = await pool.query(
        `DELETE FROM presupuestos
        WHERE id_presupuesto = $1
            AND id_usuario = $2
        RETURNING id_presupuesto`,
        [
            idPresupuesto,
            idUsuario
        ]
    );

    if (resultado.rows.length === 0) {
        throw new Error('BUDGET_NOT_FOUND');
    }

    return resultado.rows[0];
}