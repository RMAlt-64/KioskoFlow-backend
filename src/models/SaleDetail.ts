import { Model, DataTypes, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class SaleDetail extends Model<InferAttributes<SaleDetail>, InferCreationAttributes<SaleDetail>> {
  declare id: CreationOptional<number>;
  declare sale_id: number;
  declare product_id: number;
  declare quantity: number;
  declare unit_price: number; // Precio al momento de la venta
}

SaleDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sale_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'sale_details',
  }
);

export default SaleDetail;