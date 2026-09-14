import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'


interface TokenPayload {
    idUsuario: number,
    email: string
}

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {

    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).json({
            message: 'Token de auntenticacion requerida'
        });
    }

    const [tipo, token] = authorizationHeader.split(' ');

    if (tipo !== 'Bearer' || !token) {
        return res.status(401).json({
            message: 'Formato de token inválido'
        });
    }

    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        return res.status(500).json({
            message: 'Error de configuracion del servidor'
        });
    }

    try {
        const payload = jwt.verify(token, jwtSecret) as TokenPayload;

        res.locals.usuario = payload;

        next();

    } catch {
        return res.status(401).json({
            message: 'Token invalido o expirado'
        });
        
    }

}