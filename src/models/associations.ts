import Category from './Category.js';
import Product from './Product.js';
import Provider from './Provider.js';
import Customer from './Customer.js';
import Sale from './Sale.js';
import SaleDetail from './SaleDetail.js';
import User from './User.js';

// Aquí definimos todas las relaciones del sistema
const setupAssociations = () => {
  // Una categoría tiene muchos productos
  Category.hasMany(Product, { 
    foreignKey: 'category_id',
    as: 'products' // Alias para cuando quieras traer la categoría con sus productos
  });

  // Un producto pertenece a una categoría
  Product.belongsTo(Category, { 
    foreignKey: 'category_id',
    as: 'category'
  });
  
  // Un proveedor tiene muchos productos
  Provider.hasMany(Product, {
    foreignKey: 'provider_id',
    as: 'products' // Alias para cuando quieras traer el proveedor con sus productos
  });
  // Un Producto pertenece a un Proveedor
  Product.belongsTo(Provider, { 
    foreignKey: 'provider_id', 
    as: 'provider' 
  });
  // Aquí irán las futuras relaciones (ej: Proveedores, Ventas, etc.)
  // 1. Relación Clientes <-> Ventas
  Customer.hasMany(Sale, { foreignKey: 'customer_id', as: 'sales' });
  Sale.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

  // 2. Relación Muchos a Muchos entre Ventas y Productos a través de SaleDetail
  Sale.belongsToMany(Product, { 
    through: SaleDetail, 
    foreignKey: 'sale_id',
    otherKey: 'product_id',
    as: 'products'
  });

  Product.belongsToMany(Sale, { 
    through: SaleDetail, 
    foreignKey: 'product_id',
    otherKey: 'sale_id',
    as: 'sales'
  });
  
  // 3. También relacionamos de forma directa el Detalle con la Venta y el Producto 
  // (Esto nos facilita la vida para hacer consultas después)
  Sale.hasMany(SaleDetail, { foreignKey: 'sale_id', as: 'details' });
  SaleDetail.belongsTo(Sale, { foreignKey: 'sale_id' });
  
  SaleDetail.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

  User.hasMany(Sale, { foreignKey: 'user_id', as: 'sales' });
  Sale.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

export default setupAssociations;