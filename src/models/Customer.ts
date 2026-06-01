import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare phone: string | null;
  declare lastName: string | null; // El apellido puede ser opcional, especialmente para clientes ocasionales
  declare DNI: string | null; // El DNI también puede ser opcional, especialmente para clientes ocasionales
  declare creditMax: number | null; // El crédito máximo puede ser opcional, especialmente para clientes ocasionales
}

Customer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Ej: "Consumidor Final" o el nombre del cliente recurrente
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true, // Permitimos que quede vacío si es un cliente ocasional
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true, // Ej: "Consumidor Final" o el número de teléfono del cliente recurrente
    },
    DNI: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    creditMax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true, // Permitimos que quede vacío si no es un cliente con crédito
    }
    },
  {
    sequelize,
    tableName: 'customers',
  }
);

export default Customer;