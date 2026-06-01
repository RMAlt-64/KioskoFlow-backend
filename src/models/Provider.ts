import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Provider extends Model<InferAttributes<Provider>, InferCreationAttributes<Provider>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare phone: string | null; // El teléfono puede ser opcional
  declare direction: string | null; // La dirección también puede ser opcional
}

Provider.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // No queremos dos proveedores con el mismo nombre
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true, // Permitimos que quede vacío si no lo tienen
    },
    direction: {
        type: DataTypes.STRING,
        allowNull: true, // Permitimos que quede vacío si no lo tienen
    },
  },
  {
    sequelize,
    tableName: 'providers', // Plural para la base de datos
  }
);

export default Provider;