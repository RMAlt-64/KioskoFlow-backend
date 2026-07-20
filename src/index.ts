import express from 'express';
import type { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import setupAssociations from './models/associations.js';
import categoryRoutes from './routers/categoryRoutes.js';
import productRoutes from './routers/productRoutes.js';
import providerRoutes from './routers/providerRoutes.js';
import saleRoutes from './routers/saleRoutes.js';
import customerRoutes from './routers/customerRoutes.js';
import customerAccountRoutes from './routers/customerAccountRoutes.js';
import authRoutes from './routers/authRoutes.js';
import { authenticateToken } from './middleware/authMiddleware.js';
// 1. Cargamos las variables de entorno (configuraciones ocultas)
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares
app.use(cors()); // Permite peticiones del frontend (http://localhost:5173)
app.use(express.json());


app.use('/api/categories', categoryRoutes); // Usamos las rutas de categorías para cualquier petición que empiece con /categories
app.use('/api/products', productRoutes); // Usamos las rutas de productos para cualquier petición que empiece con /products
app.use('/api/providers', authenticateToken, providerRoutes); // Usamos las rutas de proveedores para cualquier petición que empiece con /providers

app.use('/api/sales', authenticateToken, saleRoutes); // Usamos las rutas de ventas para cualquier petición que empiece con /sales
app.use('/api/customers',authenticateToken, customerRoutes); // Usamos las rutas de clientes para cualquier petición que empiece con /customers
app.use('/api/customer-accounts', authenticateToken, customerAccountRoutes); // Usamos las rutas de cuentas corrientes para cualquier petición que empiece con /customer-accounts
app.use('/api/auth', authRoutes); // Usamos las rutas de autenticación para cualquier petición que empiece con /auth

async function startServer() { 
    try {
        // Probamos la conexión a la base de datos
        await sequelize.authenticate();
        setupAssociations(); // Configuramos las asociaciones entre modelos
        await sequelize.sync({ alter: true }); // Sincronizamos los modelos con la base de datos (crea tablas si no existen)

        console.log('Conexión a la base de datos exitosa.');
    
        // Iniciamos el servidor
        app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('❌ No se pudo conectar a la base de datos:', error);
    }
}
startServer();