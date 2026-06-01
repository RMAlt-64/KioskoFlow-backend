import express from 'express';
import type { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import setupAssociations from './models/associations.js';
import categoryRoutes from './routers/categoryRoutes.js';
import productRoutes from './routers/productRoutes.js';
import providerRoutes from './routers/providerRoutes.js';
import userRoutes from './routers/userRoutes.js';
import saleRoutes from './routers/saleRoutes.js';
import customerRoutes from './routers/customerRoutes.js';


// 1. Cargamos las variables de entorno (configuraciones ocultas)
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// 2. Middlewares: Permiten que el servidor entienda datos en formato JSON
app.use(express.json());

app.use('/api/categories', categoryRoutes); // Usamos las rutas de categorías para cualquier petición que empiece con /categories
app.use('/api/products', productRoutes); // Usamos las rutas de productos para cualquier petición que empiece con /products
app.use('/api/providers', providerRoutes); // Usamos las rutas de proveedores para cualquier petición que empiece con /providers
app.use('/api/users', userRoutes); // Usamos las rutas de usuarios para cualquier petición que empiece con /users
app.use('/api/sales', saleRoutes); // Usamos las rutas de ventas para cualquier petición que empiece con /sales
app.use('/api/customers', customerRoutes); // Usamos las rutas de clientes para cualquier petición que empiece con /customers



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