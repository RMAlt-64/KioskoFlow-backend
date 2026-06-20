import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Customer extends Model<InferAttributes<Customer>, InferCreationAttributes<Customer>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare phone: string | null;
  declare lastName: string | null; // El apellido puede ser opcional, especialmente para clientes ocasionales
  declare DNI: string | null; // El DNI también puede ser opcional, especialmente para clientes ocasionales
  declare creditMax: number | null; // El crédito máximo puede ser opcional, especialmente para clientes ocasionales
  declare allow_credit: boolean; // Indicador de si el cliente tiene permitido comprar fiado (Cuenta Corriente)
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
      unique: true, // El DNI debe ser único si se proporciona, para evitar duplicados en clientes recurrentes
    },
    creditMax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true, // Permitimos que quede vacío si no es un cliente con crédito
    },
    allow_credit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Por defecto, los clientes no tienen permitido comprar fiado
    },
  },
  {
    sequelize,
    tableName: 'customers',
  }
);

export default Customer;