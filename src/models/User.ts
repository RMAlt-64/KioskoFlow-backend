import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare role: 'Administrador' | 'Empleado'; // Restringimos los roles válidos con TypeScript
  declare password: string; // Agregamos la propiedad password al modelo
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
      validate: {
        notEmpty: { msg: 'El nombre de usuario no puede estar vacío.' },
      },
    },
    role: {
      type: DataTypes.ENUM('Administrador', 'Empleado'), // En SQL se crea como un ENUM para seguridad
      allowNull: false,
      defaultValue: 'Empleado',
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'La contraseña no puede estar vacía.' },
        len: {
          args: [6, 100],
          msg: 'La contraseña debe tener al menos 6 caracteres.',
        },
      },
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;