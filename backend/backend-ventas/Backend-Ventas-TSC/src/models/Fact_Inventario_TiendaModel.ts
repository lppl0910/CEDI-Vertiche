import { Model } from 'sequelize';

interface InventarioAtributos {
  id_inventario: number; // correcta
  cantidad_recibida: number; // correcta
  id_producto: number; // correcta
  id_tiempo: number; // correcta
  id_tienda: string; // correcta
  cantidad_vendida: number; // correcta
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
