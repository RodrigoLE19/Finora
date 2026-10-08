import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";
import { solicitarRecuperacion, restablecerPassword } from "../services/password-reset.service";


export const register = async (req: Request, res: Response) => {
    try {
        const {nombre, email, password} = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json ({
                message: 'Nombre, email y contraseña son obligatorios'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: 'La contraseñna debe tener al menos 6 caracteres'
            });
        }

        const usuario = await registerUser(nombre, email, password);

        return res.status(201).json({
            message: 'Usuario registrado correctamente',
            usuario
        });

    } catch (error) {
        if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS' ) {
            return res.status(409).json({
                message: 'El correo ya esta registrado'
            });
        }

        console.error('Error al registrar usuario:', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
        
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email y contraseña son oblitorias'
            });
        }

        const resultado = await loginUser(email, password);

        return res.status(200).json({
            message: 'Inicio de sesión correcto',
            ...resultado
        });

    } catch (error) {
        if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
            return res.status(401).json({
                message: 'Correo o contraseña incorrectos'
            });
        }
        
        console.error('Error al iniciar sesión', error);

        return res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
}

export const forgotPassword = async (
    req: Request,
    res: Response
) => {
    const { email } = req.body ?? {};

    if (
        typeof email !== 'string' ||
        email.trim().length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
        return res.status(400).json({
            message: 'Ingresa un correo electrónico válido'
        });
    }

    try {
        await solicitarRecuperacion(email);

        return res.status(200).json({
            message:
                'Si el correo está registrado, recibirás un enlace para recuperar tu contraseña. Revisa también la carpeta de spam.'
        });
    } catch {
        console.error('No se pudo procesar la recuperación de contraseña');

        return res.status(500).json({
            message:
                'No se pudo procesar la solicitud. Inténtalo nuevamente m+as tarde.'
        });
    }
}

export const resetPassword = async (
    req: Request,
    res: Response
) => {
    const {token, password} = req.body ?? {};

    if (typeof token !== 'string' || typeof password !== 'string') {
        return res.status(400).json({
            message: 'EL token y la nueva contraseña son obligatorias'
        });
    }

    try {
        await restablecerPassword(token, password);

        return res.status(200).json({
            message:
                'Contraseña actualizada correctamente. Inicia sesión con tu nueva contraseña.'
        });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === 'INVALID_RESET_TOKEN') {
                return res.status(400).json({
                    message:
                        'El enlace es inválido, ya fue utilizado o ha vencido. Solicita uno nuevo.'
                });
            }

            if (error.message === 'INVALID_PASSWORD') {
                return res.status(400).json({
                    message:
                        'La contraseña debe tener al menos 6 caracteres y no superar 72 bytes.'
                });
            }
        }

        console.error('No se pudo restablecer la contraseña');

        return res.status(500).json({
            message: 'No se pudo actualizar la contraseña'
        });
    }
}