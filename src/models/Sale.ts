import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Sale extends Model<InferAttributes<Sale>, InferCreationAttributes<Sale>> {
  declare id: CreationOptional<number>;
  declare total: number;
  declare customer_id: number; // Quién compró
  declare user_id: number; // Quién vendió
  declare paymentMethod: 'Efectivo' | 'Débito' | 'Cuenta corriente' | 'Transferencia' | 'Tarjeta de crédito' ; // Método de pago utilizado
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: { // <-- AGREGADO
      type: DataTypes.INTEGER,
      allowNull: true, // Obliga a que toda venta tenga un vendedor asignado
    },
    paymentMethod: {
      type: DataTypes.ENUM('Efectivo', 'Débito', 'Cuenta corriente', 'Transferencia', 'Tarjeta de crédito'), // Opciones de pago comunes
      allowNull: false,
      defaultValue: 'Transferencia', // Asumimos que la mayoría de las ventas son en efectivo
    }

  },
  {
    sequelize,
    tableName: 'sales',
  }
);

export default Sale;