import { pool } from "../config/database";
import bcrypt from 'bcryptjs';


export const registerUser = async (
    nombre: string,
    email: string,
    password: string
) => {
    const emailNormalizado = email.trim().toLowerCase();

    const usuarioExistente = await pool.query(
        'SELECT id_usuario FROM usuarios WHERE email = $1',
        [emailNormalizado]
    );

    if (usuarioExistente.rows.length > 0) {
        throw new Error('EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resultado = await pool.query(
        'INSERT INTO usuarios (nombre, email, password_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email, fecha_creacion', [nombre, emailNormalizado, passwordHash]
    );

    return resultado.rows[0];
};