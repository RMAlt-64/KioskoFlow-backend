import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

//Extendemos el tipo Request para agregarle el usuario
export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        username: string;
        role: 'Administrador' | 'Empleado';
    };
};

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        // 1. Obtener eel header de "Authorization"
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado.' });
        }

        jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, user) => {
            if (err) {
                return res.status(401).json({ message: 'Token inválido o expirado.' });
            }
            req.user = user as { id: number; username: string; role: 'Administrador' | 'Empleado' };
            next();
        });
    } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Token inválido o expirado.' });
    }
};