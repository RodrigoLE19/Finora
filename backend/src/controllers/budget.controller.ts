import { Request, Response } from "express"
import { createBudget, getBudgetsByUser, updateBudget, deleteBudget } from "../services/budget.service"
import { exportBuffer } from "node:ffi";

export const create = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const {
            idCategoria,
            montoLimite,
            mes,
            anio 
        } = req.body;

        if (!idCategoria || !montoLimite || !mes || !anio) {
            return res.status(400).json({
                message: 'Categoria, monto limite, mes y año son obligatorios'
            });
        }

        if (Number(montoLimite) <= 0) {
            return res.status(400).json({
                message: 'El monto limite debe ser mayor que 0'
            });
        }

        if (Number(mes) < 1 || Number(mes) > 12) {
            return res.status(400).json({
                message: 'El mes debe estar entre 1 y12'
            });
        }

        const presupuesto = await createBudget(
            idUsuario,
            Number(idCategoria),
            Number(montoLimite),
            Number(mes),
            Number(anio)
        );

        return res.status(201).json({
            message: 'Presupuesto creado correctamente',
            presupuesto
        });

    } catch (error) {
        
        if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
            return res.status(404).json({
                message: 'La categoria no existe'
            });
        }

        if (error instanceof Error && error.message === 'CATEGORY_MUST_BE_EXPENSE') {
            return res.status(404).json({
                message: 'El presupuesto solo puede asociarse a categorias de gasto'
            });
        }

        console.error('Error al crear presupuesto:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const getAll = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const mes = Number(req.query.mes);
        const anio = Number(req.query.anio);

        if (!mes || !anio) {
            return res.status(400).json({
                message: 'Mes y año son obligatorios'
            });
        }

        if (mes < 1 || mes > 12) {
            return res.status(400).json({
                message: 'El mes debe estar entre 1y 12'
            });
        }

        const presupuestos = await getBudgetsByUser(
            idUsuario, 
            mes,
            anio 
        );

        return res.status(200).json({
            presupuestos
        });

    } catch (error) {
        console.error('Error al obtener presupuestos:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const update = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;
        const idPresupuesto = Number(req.params.id);

        const {
            idCategoria,
            montoLimite,
            mes,
            anio
        } = req.body;

        if (!idPresupuesto) {
            return res.status(400).json({
                message: 'ID de presupuesto invalido'
            });
        }

        if (!idCategoria || !montoLimite || !mes || !anio) {
            return res.status(400).json({
                message: 'Categorias, monto límite, mes y año son obligatorios'
            });
        }

        if (Number(montoLimite) <= 0) {
            return res.status(400).json({
                message: 'El monto límite debe ser mayor que 0'
            });
        }

        if (Number(mes) < 1 || Number(mes) > 12) {
            return res.status(400).json({
                message: 'El mes debe estar en 1 y 12'
            });
        }

        const presupuesto = await updateBudget(
            idPresupuesto,
            idUsuario,
            Number(idCategoria),
            Number(montoLimite),
            Number(mes),
            Number(anio)
        );

        return res.status(200).json({
            message: 'Presupuesto actualizado correctamente',
            presupuesto
        });

    } catch (error) {
        
        if (error instanceof Error && error.message === 'CATEGORY_NOT_FOUND') {
            return res.status(404).json({
                message: 'La categoria no existe'
            });
        }

        if (error instanceof Error && error.message === 'CATEGORY_MUST_BE_EXPENSE') {
            return res.status(404).json({
                message: 'El presupuesto solo puede asociarse a categorias de gasto'
            });
        }

        if (error instanceof Error && error.message === 'BUDGET_NOT_FOUND') {
            return res.status(404).json({
                message: 'Presupuesto no encontrado'
            });
        }

        console.error('Error al actualizar presupuestos:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const remove = async (req: Request, res: Response) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;
        const idPresupuesto = Number(req.params.id);

        if (!idPresupuesto) {
            return res.status(400).json({
                message: 'ID de presupuesto inválido'
            });
        }

        await deleteBudget(
            idPresupuesto,
            idUsuario
        );

        return res.status(200).json({
            message: 'Presupuesto eliminado correctamente'
        });

    } catch (error) {
        
        if (error instanceof Error && error.message === 'BUDGET_NOT_FOUND') {
            return res.status(404).json({
                message: 'Presupuesto no encontrado'
            });
        }

        console.error('Error al eliminar presupuesto:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}