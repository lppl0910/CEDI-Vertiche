/**
 * Modelo Sequelize para la tabla de hechos `Fact_Inventario_Tienda`.
 *
 * Registra el inventario de productos enviados y vendidos por tienda en una
 * fecha específica.  La diferencia entre `cantidad_recibida` y `cantidad_vendida`
 * da el inventario disponible en ese corte de tiempo.
 * Se relaciona con `Dim_Producto`, `Dim_Tiempo` y `Dim_Tienda`.
 */
import { Model } from 'sequelize';

/** Atributos de la tabla `Fact_Inventario_Tienda`. */
interface InventarioAtributos {
  id_inventario:     number;
  cantidad_recibida: number;  // unidades enviadas a la tienda en esa fecha
  id_producto:       number;
  id_tiempo:         number;
  id_tienda:         string;
  cantidad_vendida:  number;  // unidades vendidas de ese producto en esa fecha
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Fact_Inventario_Tienda extends Model<InventarioAtributos> implements InventarioAtributos {
    id_inventario!: number;
    cantidad_recibida!: number;
    id_producto!: number;
    id_tiempo!: number;
    id_tienda!: string;
    cantidad_vendida!: number;

    static associate(models: any) {
      Fact_Inventario_Tienda.belongsTo(models.Dim_Producto, { foreignKey: 'id_producto' });
      Fact_Inventario_Tienda.belongsTo(models.Dim_Tiempo, { foreignKey: 'id_tiempo' });
      Fact_Inventario_Tienda.belongsTo(models.Dim_Tienda, { foreignKey: 'id_tienda' });
    }
  }

  Fact_Inventario_Tienda.init(
    {
      id_inventario: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      cantidad_recibida: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_tiempo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_tienda: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      cantidad_vendida: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 0 },
      },
    },
    {
      sequelize,
      modelName: 'Fact_Inventario_Tienda',
    }
  );

  return Fact_Inventario_Tienda;
};
