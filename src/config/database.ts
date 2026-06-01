import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Leemos el archivo .env
dotenv.config();

// Creamos la conexión
const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST as string,
    port: Number(process.env.DB_PORT),
    dialect: 'postgres', // Le decimos que use PostgreSQL
    logging: false,      // Para que no ensucie la consola con mucho texto
  }
);

export default sequelize;