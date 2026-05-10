import { Model } from 'sequelize';

interface VentasAtributos {
  id_venta: number; // correcta
  id_nota: string; // correcta
  id_producto: number; // correcta
  id_tienda: string; // correcta
  id_tiempo: number; // correcta
  precio_final: number; // correcta
  precio_original: number; // correcta
  cantidad: number; // correcta
  es_descuento: boolean; // correcta
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Fact_Ventas extends Model<VentasAtributos> implements VentasAtributos {
    id_venta!: number;
    id_nota!: string;
    id_producto!: number;
    id_tienda!: string;
    id_tiempo!: number;
    precio_final!: number;
    precio_original!: number;
    cantidad!: number;
    es_descuento!: boolean;

    static associate(models: any) {
      Fact_Ventas.belongsTo(models.Dim_Producto, { foreignKey: 'id_producto' });
      Fact_Ventas.belongsTo(models.Dim_Tienda, { foreignKey: 'id_tienda' });
      Fact_Ventas.belongsTo(models.Dim_Tiempo, { foreignKey: 'id_tiempo' });
    }
  }

  Fact_Ventas.init(
    {
      id_venta: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_nota: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true,
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_tienda: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      id_tiempo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      precio_final: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 },
      },
      precio_original: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 },
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      es_descuento: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Fact_Ventas',
    }
  );

  return Fact_Ventas;
};
