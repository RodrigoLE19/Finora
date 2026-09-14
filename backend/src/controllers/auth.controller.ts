import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";



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