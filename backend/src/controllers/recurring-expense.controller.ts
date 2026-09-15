import { Request, Response } from "express"
import { createRecurringExpense, getRecurringExpensesByUser, updateRecurringExpense, deleteRecurringExpense } from "../services/recurring-expense.service,"
import { json } from "node:stream/consumers";

export const create = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const {
            idCategoria,
            descripcion,
            monto,
            frecuencia,
            diaPago
        } = req.body;

        if (!idCategoria || !descripcion || !monto || !frecuencia) {
            return res.status(400).json({
                message: 'Categoria, descripcion, monto y frecuencia son obligatorias'
            });
        }

        if (Number(monto) <= 0) {
            return res.status(400).json({
                message: 'El monto debe ser mayor a 0'
            });
        }

        if (frecuencia !== 'MENSUAL') {
            return res.status(400).json({
                message: 'Por ahora la frecuencia debe ser MENSUAL'
            });
        }

        if (
            diaPago !== undefined &&
            diaPago !== null &&
            (Number(diaPago) < 1 || Number(diaPago) > 31)
        ) {
            return res.status(400).json({
                message: 'El dia de pago debe estar entre 1 y 31'
            });
        }

        const gastoRecurrente = await createRecurringExpense(
            idUsuario,
            Number(idCategoria),
            descripcion,
            Number(monto),
            frecuencia,
            diaPago !== undefined && diaPago !== null ? Number(diaPago): null
        );

        return res.status(201).json({
            message: 'Gasto recurrente creado correctamente',
            gastoRecurrente
        });

    } catch (error) {
        
        if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
            return res.status(404).json({
                message: 'La categoria no existe'
            });
        }

        if (error instanceof Error && error.message === 'CATEGORY_MUST_BE_EXPENSE') {
            return res.status(400).json({
                message: 'El gasto recurrente solo puede asociarse a categorias de gasto'
            });
        }

        console.error('Error al crear gasto recurrente:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const getAll = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const gastosRecurrentes = await getRecurringExpensesByUser(idUsuario);

        return res.status(200).json({
            gastosRecurrentes
        });

    } catch (error) {
        console.error('Error al obtener gastos recurrentes:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const update = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;
        const idGastoRecurrente = Number(req.params.id);

        const {
            idCategoria,
            descripcion,
            monto,
            frecuencia,
            diaPago,
            activo
        } = req.body;

        if (!idGastoRecurrente) {
            return res.status(400).json({
                message: 'ID de gasto recurrente inválido'
            });
        }

        if (!idCategoria || !descripcion || !monto || !frecuencia) {
            return res.status(400).json({
                message: 'Categoria, descripcion, monto y frecuencia son obligatorias'
            });
        }

        if (Number(monto) <= 0) {
            return res.status(400).json({
                message: 'El monto debe ser mayor que 0'
            });
        }

        if (frecuencia !== 'MENSUAL') {
            return res.status(400).json({
                message: 'Por ahora la frecuencia debe ser MENSUAL'
            });
        }

        if (
            diaPago !== undefined &&
            diaPago !== null &&
            (Number(diaPago) < 1 || Number(diaPago) > 31)
        ) {
            return res.status(400).json({
                message: 'El dia de pago debe estar entre 1 y 31'
            });
        }

        if (typeof activo !== 'boolean') {
            return res.status(400).json({
                message: 'El estado debe ser true o false'
            });
        }

        const gastoRecurrente = await updateRecurringExpense(
            idGastoRecurrente,
            idUsuario,
            Number(idCategoria),
            descripcion,
            Number(monto),
            frecuencia,
            diaPago !== undefined && diaPago !== null ? Number(diaPago): null, activo
        );

        return res.status(200).json({
            message: 'Gasto recurrente actualizado correctamente',
            gastoRecurrente
        });
    } catch (error) {
        
        if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
            return res.status(404).json({
                message: 'La categoria no exite'
            });
        }

        if (error instanceof Error && error.message === 'CATEGORY_MUST_BE_EXPENSE') {
            return res.status(400).json({
                message: 'El gasto recurrente solo puede asociarse a categorias de gasto'
            });
        }

        if (
            error instanceof Error &&
            error.message === 'CATEGORY_EXPENSE_NOT_FOUND'
        ) {
            return res.status(404).json({
                message: 'Gasto recurrente no encontrado'
            });
        }

        console.error('Error al actualizar gasto recurrente', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const remove = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;
        const idGastoRecurrente = Number(req.params.id);

        if (!idGastoRecurrente) {
            return res.status(400).json({
                message: 'ID de gasto recurrente inválido'
            });
        }

        await deleteRecurringExpense(
            idGastoRecurrente,
            idUsuario
        );

        return res.status(200).json({
            message: 'Gasto recurrente eliminado correctamente'
        });
    } catch (error) {
        if (
            error instanceof Error &&
            error.message === 'RECURRING_EXPENSE_NOT_FOUND'
        ) {
            return res.status(400).json({
                message: 'Gasto recurrente no encontrado'
            });
        }

        console.error('Error al eliminar gasto recurrente', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}