import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class CustomerAccount extends Model<InferAttributes<CustomerAccount>, InferCreationAttributes<CustomerAccount>> {
  declare id: CreationOptional<number>;
  declare customer_id: number;
  declare sale_id: number | null; // Si el movimiento viene de una venta, guardamos cuál fue. Si es un pago en efectivo, queda en NULL.
  declare type: 'debit' | 'credit'; // 'debit' = suma deuda (compró fiado), 'credit' = resta deuda (vino a pagar)
  declare amount: number; // El monto del movimiento
  declare description: string | null; // Ej: "Compra fiada ticket #5" o "Entrega de efectivo entrega parcial"
}

CustomerAccount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null si el cliente solo viene a traer plata sin comprar nada
    },
    type: {
      type: DataTypes.ENUM('debit', 'credit'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'customer_accounts',
  }
);

export default CustomerAccount;