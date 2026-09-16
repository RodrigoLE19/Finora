import { Request, Response } from "express"
import { getMonthlyEvolution, getIncomeVsExpenses, getExpensesByCategory } from "../services/statistics.service"
import { getMonthlyComparison } from "../services/dashboard.service";


export const getStatistics = async (
    req: Request,
    res: Response
) => {
    try {
        const idUsuario = res.locals.usuario.idUsuario;

        const mes = Number(req.query.mes);
        const anio = Number(req.query.anio);

        if (!mes || !anio) {
            return res.status(400).json({
                message: 'Mes y año son obligatoris'
            });
        }

        if (mes < 1 || mes > 12) {
            return res.status(400).json({
                message: 'El mes debe estar entre 1 y 12'
            });
        }

        const evolucionMensual = await getMonthlyEvolution(
            idUsuario
        );

        const ingresosVsGastos = await getIncomeVsExpenses(
            idUsuario,
            mes,
            anio
        );

        const gastosPorCategoria = await getExpensesByCategory(
            idUsuario,
            mes,
            anio
        );

        const comparacionMensual = await getMonthlyComparison(
            idUsuario,
            mes,
            anio
        );

        return res.status(200).json({
            evolucionMensual,
            ingresosVsGastos,
            gastosPorCategoria,
            comparacionMensual
        });

    } catch (error) {
        console.error('Error al obtener estadísticas:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }

}