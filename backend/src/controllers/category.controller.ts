import { Request, Response } from "express"
import { getCategorias } from "../services/category.service"

export const getAllCategories = async (
    req: Request,
    res: Response
) => {
    try {
        const categorias = await getCategorias();

        return res.status(200).json({
            categorias
        });

    } catch (error) {
        console.error('Error al obtener categorias:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }

}