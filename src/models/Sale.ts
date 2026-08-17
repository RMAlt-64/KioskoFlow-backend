import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Sale extends Model<InferAttributes<Sale>, InferCreationAttributes<Sale>> {
  declare id: CreationOptional<number>;
  declare total: number;
  declare customer_id: number; // Quién compró
  declare user_id: number; // Quién vendió
  declare paymentMethod: 'Efectivo' | 'Débito' | 'Cuenta corriente' | 'Transferencia' | 'Tarjeta de crédito';
  declare status: CreationOptional<'completada' | 'anulada'>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
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
      allowNull: false, // Obliga a que toda venta tenga un vendedor asignado
    },
    paymentMethod: {
      type: DataTypes.ENUM('Efectivo', 'Débito', 'Cuenta corriente', 'Transferencia', 'Tarjeta de crédito'),
      allowNull: false,
      defaultValue: 'Efectivo',
    },
    status: {
      type: DataTypes.ENUM('completada', 'anulada'),
      allowNull: false,
      defaultValue: 'completada',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'sales',
  }
);

export default Sale;