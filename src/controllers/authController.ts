import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Arriba del todo, fuera de las funciones
const loginAttempts: Record<string, { count: number; blockedUntil: number }> = {}
const MAX_ATTEMPTS = 5
const BLOCK_TIME = 5 * 60 * 1000 // 5 minutos en milisegundos

export const register = async (req: Request, res: Response) => {
    const { username, password, role } = req.body;
    
    try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está en uso.' });
        }
    
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Crear el nuevo usuario
        const newUser = await User.create({
        username,
        password: hashedPassword,
        role,
        });
    
        res.status(201).json({ message: 'Usuario registrado exitosamente.', user: { id: newUser.id, username: newUser.username, role: newUser.role } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario.' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    // Verificar si el usuario está bloqueado
    const attempts = loginAttempts[username];
    if (attempts && attempts.blockedUntil > Date.now()) {
    const minutes = Math.ceil((attempts.blockedUntil - Date.now()) / 60000)
    return res.status(429).json({ message: `Demasiados intentos fallidos. Esperá ${minutes} minuto(s).` })
    };
    
    try {
        // Buscar el usuario por nombre de usuario
        const user = await User.findOne({ where: { username } });
        
        if (!user) {
        return res.status(400).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
        }
    
        // Comparar la contraseña ingresada con la almacenada
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
                        // Registrar intento fallido
            if (!loginAttempts[username]) {
                loginAttempts[username] = { count: 0, blockedUntil: 0 }
            }
            loginAttempts[username].count++

            if (loginAttempts[username].count >= MAX_ATTEMPTS) {
                loginAttempts[username].blockedUntil = Date.now() + BLOCK_TIME
            }
            return res.status(400).json({ message: 'Nombre de usuario o contraseña incorrectos.' });
        }

    
        // Generar un token JWT
        const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET || 'secret', // Asegúrate de tener una variable de entorno para la clave secreta
        { expiresIn: '1h' }
        );
    
        res.status(200).json({ message: 'Inicio de sesión exitoso.', token, user: { id: user.id, username: user.username, role: user.role } });
        delete loginAttempts[username];
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al iniciar sesión.' });
    }
};

export const getUsers = async (req: Request, res: Response) => {
    const users = await User.findAll({ attributes: ['id', 'username', 'role'] })
    return res.status(200).json(users)
}

