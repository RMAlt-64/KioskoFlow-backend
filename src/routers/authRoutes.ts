import { Router } from "express";
import { register, login, getUsers } from "../controllers/authController.js";
import { authenticateToken, requireAdmin } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get('/users', authenticateToken, requireAdmin, getUsers); // Ejemplo de ruta protegida que requiere autenticación y rol de administrador')
router.post('/users', authenticateToken, requireAdmin, register); // Ejemplo de ruta protegida que requiere autenticación y rol de administrador

export default router;