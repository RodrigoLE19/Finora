import { pool } from "../config/database"


export const createMovement = async (
    idUsuario: number,
    idCategoria: number,
    tipo: string,
    monto: number,
    descripcion: string | null,
    fecha: string,
    idGastoRecurrente: number | null
) => {

    const categoriaResult = await pool.query(
        'SELECT id_categoria, tipo FROM categorias WHERE id_categoria = $1', [idCategoria]
    );

    if (categoriaResult.rows.length === 0) {
        throw new Error('CATEGORY_NOT_FOUND');
    }

    const categoria = categoriaResult.rows[0];

    if (categoria.tipo !== tipo) {
        throw new Error('CATEGORY_TYPE_MISMATCH');
    }

    if (idGastoRecurrente !== null) {
        
        if (tipo !== 'GASTO') {
            throw new Error('RECURRING_EXPENSE_MUST_BE_EXPENSE');
        }

        const gastoRecurrenteResult = await pool.query(
            `SELECT
                id_gasto_recurrente,
                id_categoria
            FROM gastos_recurrentes
            WHERE id_gasto_recurrente = $1
                AND id_usuario = $2`,
                [
                    idGastoRecurrente,
                    idUsuario
                ]
        );

        if (gastoRecurrenteResult.rows.length === 0) {
            throw new Error('RECURRING_EXPENSE_NOT_FOUND');
        }

        const gastoRecurrente = gastoRecurrenteResult.rows[0];

        if (gastoRecurrente.id_categoria !== idCategoria) {
            throw new Error('RECURRING_EXPENSE_CATEGORY_MISMATCH');
        }
    }

    const resultado = await pool.query(
        `INSERT INTO movimientos
            (id_usuario, id_categoria, id_gasto_recurrente, tipo, monto, descripcion, fecha)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
            id_movimiento,
            id_usuario,
            id_categoria,
            id_gasto_recurrente,
            tipo,
            monto,
            descripcion,
            fecha,
            fecha_creacion`,
        [
            idUsuario,
            idCategoria,
            idGastoRecurrente,
            tipo,
            monto,
            descripcion,
            fecha
        ]
    );

    return resultado.rows[0];
}

export const getMovementsByUser = async (idUsuario: number) => {
    const resultado = await pool.query(
        `SELECT 
            m.id_movimiento,
            m.id_categoria,
            c.nombre AS categoria,
            m.tipo,
            m.monto,
            m.descripcion,
            m.fecha,
            m.fecha_creacion
        FROM movimientos m
        INNER JOIN categorias c
            ON m.id_categoria = c.id_categoria
        WHERE m.id_usuario = $1
        ORDER BY m.fecha DESC, m.id_movimiento DESC`,
        [idUsuario]
    );

    return resultado.rows;
}

export const updateMovement = async (
    idMovimiento:number,
    idUsuario: number,
    idCategoria: number,
    tipo: string,
    monto: number,
    descripcion: string | null,
    fecha: string
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

    if (categoria.tipo !== tipo) {
        throw new Error('CATEGORY_TYPE_MISMATCH');
    }

    const resultado = await pool.query(
        `UPDATE movimientos 
        SET
            id_categoria = $1,
            tipo = $2,
            monto = $3,
            descripcion = $4,
            fecha = $5
        WHERE id_movimiento = $6
            AND id_usuario = $7
        RETURNING
            id_movimiento,
            id_usuario,
            id_categoria,
            tipo,
            monto,
            descripcion,
            fecha,
            fecha_creacion`,
        [
            idCategoria,
            tipo,
            monto,
            descripcion,
            fecha,
            idMovimiento,
            idUsuario
        ]
    );

    if (resultado.rows.length === 0) {
        throw new Error('MOVEMENT_NOT_FOUND');
    }

    return resultado.rows[0];

}

export const deleteMovement = async (
    idMovimiento: number,
    idUsuario: number
) => {

    const resultado = await pool.query(
        `DELETE FROM movimientos 
        WHERE id_movimiento = $1
            AND id_usuario = $2
        RETURNING id_movimiento`,
        [
            idMovimiento,
            idUsuario
        ]
    );

    if (resultado.rows.length === 0) {
        throw new Error('MOVEMENT_NOT_FOUND');
    }

    return resultado.rows[0];
}