import { Request, Response } from "express"
import { createMovement, getMovementsByUser, updateMovement, deleteMovement } from "../services/movement.service";


export const create = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const {
            idCategoria,
            tipo,
            monto,
            descripcion,
            fecha,
            idGastoRecurrente
        } = req.body;

        if (!idCategoria || !tipo || !monto || !fecha) {
            return res.status(400).json({
                message: 'Categoria, tipo, monto y fecha son obligatorios'
            });
        }

        if (Number(monto) <= 0) {
            return res.status(400).json({
                message: 'El monto debe ser mayor que 0'
            });
        }

        const movimiento = await createMovement(
            idUsuario,
            Number(idCategoria),
            tipo,
            Number(monto),
            descripcion ?? null,
            fecha,
            idGastoRecurrente !== undefined && idGastoRecurrente !== null
                ? Number(idGastoRecurrente) : null
        );

        return res.status(201).json({
            message: 'Movimiento registrado correctamente',
            movimiento
        });
    } catch (error) {

        if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
            return res.status(404).json({
                message: 'La categoria no existe'
            });
        }

        if (error instanceof Error && error.message === 'CATEGORY_TYPE_MISMATCH') {
            return res.status(404).json({
                message: 'La categoria no corresponde al tipo de movimiento'
            });
        }

        if (
            error instanceof Error &&
            error.message === 'RECURRING_EXPENSE_NOT_FOUND'
        ) {
            return res.status(404).json({
                message: 'El gasto recurrente no existe'
            });
        }

        if (
            error instanceof Error &&
            error.message === 'RECURRING_EXPENSE_MUST_BE_EXPENSE'
        ) {
            return res.status(400).json({
                message: 'Un gasto recurrente solo puede asociarse a un movimiento de gasto'
            });
        }

        if (
            error instanceof Error &&
            error.message === 'RECURRING_EXPENSE_CATEGORY_MISMATCH'
        ) {
            return res.status(400).json({
                message: 'La categoría del movimiento no coincide con la del gasto recurrente'
            });
        }

        console.error('Error al registra movimiento:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });

    }
};

export const getAll = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const movimientos = await getMovementsByUser(idUsuario);

        return res.status(200).json({
            movimientos
        });
    } catch (error) {
        console.error('Error al obtener movimientos:', error)

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

export const update = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;
        const idMovimiento = Number(req.params.id);

        const {
            idCategoria,
            tipo,
            monto,
            descripcion,
            fecha
        } = req.body;

        if (!idMovimiento) {
            return res.status(400).json({
                message: 'ID de movimiento inválido'
            });
        }

        if (!idCategoria || !tipo || !monto || !fecha) {
            return res.status(400).json({
                message: 'Categoria, tipo, monto y fecha vson oblitorios'
            });
        }

        if (!['INGRESO', 'GASTO'].includes(tipo)) {
            return res.status(400).json({
                message: 'El tipo debe ser INGRESO o GASTO'
            });
        }

        if (Number(monto) <= 0) {
            return res.status(400).json({
                message: 'El monto debe ser mayor que 0'
            });
        }

        const movimiento = await updateMovement(
            idMovimiento,
            idUsuario,
            Number(idCategoria),
            tipo,
            Number(monto),
            descripcion ?? null,
            fecha
        );

        return res.status(200).json({
            message: 'Movimiento actualizado correctamente',
            movimiento
        });

    } catch (error) {

        if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
            return res.status(404).json({
                message: 'La categoria no existe'
            });
        }

        if (error instanceof Error && error.message === 'CATEGORY_TYPE_MISMATCH') {
            return res.status(404).json({
                message: 'La categoria no corresponde al tipo de movimiento'
            });
        }

        if (error instanceof Error && error.message === 'MOVEMENT_NOT_FOUND') {
            return res.status(404).json({
                message: 'Movimiento no encontrado'
            });
        }

        console.error('Error al actualizar movimiento:', error);

        return res.status(500).json({
            message: 'Erro interno del servidor'
        });
    }
}

export const remove = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;
        const idMovimiento = Number(req.params.id);

        if (!idMovimiento) {
            return res.status(400).json({
                message: 'ID de movimiento inválido'
            });
        }

        await deleteMovement(
            idMovimiento,
            idUsuario
        );

        return res.status(200).json({
            message: 'Movimiento eliminado correctamente'
        });

    } catch (error) {

        if (error instanceof Error && error.message === 'MOVEMENT_NOT_FOUND') {
            return res.status(404).json({
                message: 'Movimiento no encontrado'
            });
        }

        console.error('Error al eliminar movimiento:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}