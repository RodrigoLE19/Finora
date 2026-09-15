import { pool } from "../config/database"


export const getCategorias = async () => {

    const resultado = await pool.query(
        `SELECT 
            id_categoria,
            nombre,
            tipo
        FROM categorias
        ORDER BY tipo, nombre`
    );

    return resultado.rows;
}