import { Model } from 'sequelize';

interface TiempoAtributos {
  id_tiempo: number;
  fecha: Date;
  anio: number;
  mes_nombre: string;
  semana: number;
  dia_semana: string;
  numero_dia: number;
  trimestre: number;
  temporada: string;
  es_festivo: boolean;
}

export enum TiempoDiaSemana {
  LUNES = 'Lunes',
  MARTES = 'Martes',
  MIERCOLES = 'Miércoles',
  JUEVES = 'Jueves',
  VIERNES = 'Viernes',
  SABADO = 'Sábado',
  DOMINGO = 'Domingo',
}

export enum TiempoTemporada {
  BUEN_FIN = 'Buen Fin',
  LIQUIDACION = 'Liquidación de Temporada',
  MADRES = 'Día de las madres',
  REGULAR = 'Temporada Regular',
  PRIMAVERA = 'Primavera',
  VERANO = 'Verano',
  OTONO = 'Otoño',
  INVIERNO = 'Invierno',
  NAVIDAD = 'Navidad',
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Dim_Tiempo extends Model<TiempoAtributos> implements TiempoAtributos {
    id_tiempo!: number;
    fecha!: Date;
    anio!: number;
    mes_nombre!: string;
    semana!: number;
    dia_semana!: string;
    numero_dia!: number;
    trimestre!: number;
    temporada!: string;
    es_festivo!: boolean;

    static associate(models: any) {
      Dim_Tiempo.hasMany(models.Fact_Ventas, { foreignKey: 'id_tiempo' });
      Dim_Tiempo.hasMany(models.Fact_Inventario_Tienda, { foreignKey: 'id_tiempo' });
    }
  }

  Dim_Tiempo.init(
    {
      id_tiempo: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      anio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mes_nombre: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      semana: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      dia_semana: {
        type: DataTypes.ENUM,
        values: Object.values(TiempoDiaSemana),
        allowNull: false,
      },
      numero_dia: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trimestre: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 4 },
      },
      temporada: {
        type: DataTypes.ENUM,
        values: Object.values(TiempoTemporada),
        allowNull: false,
      },
      es_festivo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: 'Dim_Tiempo',
    }
  );

  return Dim_Tiempo;
};