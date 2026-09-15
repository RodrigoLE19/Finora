import { pool } from "../config/database"


export const createRecurringExpense = async (
    idUsuario: number,
    idCategoria: number,
    descripcion: string,
    monto: number,
    frecuencia: string,
    diaPago: number | null
) => {

    const categoriaResult = await pool.query(
        `SELECT id_categoria, tipo
         FROM categorias
         WHERE id_categoria = $1`,
         [
            idCategoria
         ]
    );

    if (categoriaResult.rows.length === 0) {
        throw new Error('CATEGORY_NOT_FOUND');
    }

    const categoria = categoriaResult.rows[0];

    if (categoria.tipo !== 'GASTO') {
        throw new Error('CATEGORY_MUST_BE_EXPENSE');
    }

    const resultado = await pool.query(
        `INSERT INTO gastos_recurrentes
            (
                id_usuario,
                id_categoria,
                descripcion,
                monto,
                frecuencia,
                dia_pago
            )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING
                id_gasto_recurrente,
                id_usuario,
                id_categoria,
                descripcion,
                monto,
                frecuencia,
                dia_pago,
                activo,
                fecha_creacion`,
                [
                    idUsuario,
                    idCategoria,
                    descripcion,
                    monto,
                    frecuencia,
                    diaPago
                ]
    );

    return resultado.rows[0];
}

export const getRecurringExpensesByUser = async (
    idUsuario: number
) => {

    const resultado = await pool.query(
        `SELECT
            gr.id_gasto_recurrente,
            gr.id_categoria,
            c.nombre AS categoria,
            gr.descripcion,
            gr.monto,
            gr.frecuencia,
            gr.dia_pago,
            gr.activo,
            gr.fecha_creacion
        FROM gastos_recurrentes gr
        INNER JOIN categorias c
            ON gr.id_categoria = c.id_categoria
        WHERE gr.id_usuario = $1
        ORDER BY gr.activo DESC, gr.dia_pago, gr.descripcion`,
        [idUsuario]
    );

    return resultado.rows;
};

export const updateRecurringExpense = async (
    idGastoRecurrente: number,
    idUsuario: number,
    idCategoria: number,
    descripcion: string,
    monto: number,
    frecuencia: string,
    diaPago: number | null,
    activo: boolean
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
        `UPDATE gastos_recurrentes
        SET
            id_categoria = $1,
            descripcion = $2,
            monto = $3,
            frecuencia = $4,
            dia_pago = $5,
            activo =$6
        WHERE id_gasto_recurrente = $7
            AND id_usuario = $8
        RETURNING
            id_gasto_recurrente,
            id_usuario,
            id_categoria,
            descripcion,
            monto,
            frecuencia,
            dia_pago,
            activo,
            fecha_creacion`,
            [
                idCategoria,
                descripcion,
                monto,
                frecuencia,
                diaPago,
                activo,
                idGastoRecurrente,
                idUsuario
            ]
    );

    if (resultado.rows.length === 0) {
        throw new Error('RETURNING_EXPENSE_NOT_FOUND');
    }

    return resultado.rows[0];
}

export const deleteRecurringExpense = async (
    idGastoRecurrente: number,
    idUsuario: number
) => {

    const resultado = await pool.query(
        `DELETE FROM gastos_recurrentes
        WHERE id_gasto_recurrente = $1
            AND id_usuario = $2
        RETURNING id_gasto_recurrente`,
        [
            idGastoRecurrente,
            idUsuario
        ]
    );

    if (resultado.rows.length === 0) {
        throw new Error('RECURRING_EXPENSE_NOT_FOUND');
    }

    return resultado.rows[0];
}