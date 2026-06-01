import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare role: 'Administrador' | 'Empleado'; // Restringimos los roles válidos con TypeScript
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM('Administrador', 'Empleado'), // En SQL se crea como un ENUM para seguridad
      allowNull: false,
      defaultValue: 'Empleado',
    }
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;