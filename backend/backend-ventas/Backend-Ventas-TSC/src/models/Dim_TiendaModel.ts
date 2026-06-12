/**
 * Modelo Sequelize para la tabla de dimensión `Dim_Tienda`.
 *
 * Almacena la información geográfica y de clasificación de cada punto de venta
 * de Vertiche. Las tiendas se agrupan en región Norte o Sur, dato utilizado
 * por los controladores de análisis para filtrar y comparar zonas.
 */
import { Model } from 'sequelize';

/** Atributos de la tabla `Dim_Tienda`. */
interface TiendaAtributos {
  id_tienda: string;
  nombre:    string;
  region:    string; // enum TiendaRegion
  estado:    string;
  latitud:   number;
  longitud:  number;
  ciudad:    string;
}

/** Regiones geográficas válidas para una tienda. */
export enum TiendaRegion {
  NORTE = 'Norte',
  SUR   = 'Sur',
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Dim_Tienda extends Model<TiendaAtributos> implements TiendaAtributos {
    id_tienda!: string;
    nombre!: string;
    region!: string;
    estado!: string;
    latitud!: number;
    longitud!: number;
    ciudad!: string;

    static associate(models: any) {
      Dim_Tienda.hasMany(models.Fact_Ventas, { foreignKey: 'id_tienda' });
      Dim_Tienda.hasMany(models.Fact_Inventario_Tienda, { foreignKey: 'id_tienda' });
    }
  }

  Dim_Tienda.init(
    {
      id_tienda: {
        type: DataTypes.STRING(10),
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      region: {
        type: DataTypes.ENUM,
        values: Object.values(TiendaRegion),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      latitud: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
      longitud: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false,
      },
      ciudad: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Dim_Tienda',
    }
  );

  return Dim_Tienda;
};
