import { Model } from 'sequelize';

interface TiendaAtributos {
  id_tienda: string; // correcto
  nombre: string; // correcto
  region: string; // ya es un enum 
  estado: string; // correcto un enun de 32 esta largo
  latitud: number; // correcto
  longitud: number; // correcto
  ciudad: string; // correcto
}

export enum TiendaRegion {
  NORTE = 'Norte',
  SUR = 'Sur',
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
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false,
      },
      longitud: {
        type: DataTypes.DECIMAL(10, 8),
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
