import { Request, Response } from "express"
import { getFinancialSummary, getMonthlyComparison, getRecentMovements, getExpenseDistribution } from "../services/dashboard.service";

export const getSummary = async (
    req: Request,
    res: Response
) => {
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
                message: 'El mes debe estar entre 1 y 12'
            });
        }

        const resumen = await getFinancialSummary(
            idUsuario,
            mes,
            anio
        );

        const comparacion = await getMonthlyComparison(
            idUsuario,
            mes,
            anio
        );

        const movimientosRecientes = await getRecentMovements(
            idUsuario
        );

        const distribucionGastos = await getExpenseDistribution(
            idUsuario,
            mes,
            anio
        );

        return res.status(200).json({
            resumen,
            comparacion,
            movimientosRecientes,
            distribucionGastos
        });
        
    } catch (error) {
        console.error('Error al obtener resumen financiero', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}