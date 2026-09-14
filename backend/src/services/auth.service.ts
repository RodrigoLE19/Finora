import { pool } from "../config/database";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'


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

export const loginUser = async (
    email: string,
    password: string
) => {
    const emailNormalizado = email.trim().toLowerCase();

    const resultado = await pool.query(
        'SELECT id_usuario, nombre, email, password_hash FROM usuarios WHERE email = $1', [emailNormalizado]
    );

    if (resultado.rows.length === 0) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const usuario = resultado.rows[0];

    const passwordValida = await bcrypt.compare(
        password,
        usuario.password_hash
    );

    if (!passwordValida) {
        throw new Error('INVALID_CREDENTIALS');
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET_NOT_CONFIGURED');
    }

    const token = jwt.sign(
        {
            idUsuario: usuario.id_usuario,
            email: usuario.email
        },
        jwtSecret,
        {
            expiresIn: '2h'

        }
    );

    return {
        usuario: {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            email: usuario.email
        },
        token
    };
}