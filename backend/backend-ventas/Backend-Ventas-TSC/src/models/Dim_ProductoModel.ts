import { Model } from 'sequelize';

interface ProductoAtributos {
  id_producto: number; // es correcto
  modelo_id: number; // es correcto
  descripcion: string; // es correcto
  material_principal: string; // es correcto
  porcentaje_principal: number; // es correcto
  composicion_completa: string; // es correcto
  talla: string; // es un enum
  color: string; // es correcto
  temporada: string; // es un enum
  categoria: string; // es un enum
  fit: string; // es un enunm
  precio_lista: number; // es correcto
}

export enum ProductoTalla {
  T3 = '3',
  T5 = '5',
  T7 = '7',
  T9 = '9',
  T11 = '11',
  T13 = '13',
  T15 = '15',
  T34 = '34',
  T36 = '36',
  T38 = '38',
  T40 = '40',
  T42 = '42',
  UNITALLA = 'Unitalla',
  XCH = 'XCH',
  CH = 'CH',
  M = 'M',
  G = 'G',
  XG = 'XG',
}

export enum ProductoTemporada {
  PRIMAVERA = 'Primavera',
  VERANO = 'Verano',
  OTONO = 'Otoño',
  INVIERNO = 'Invierno',
}

export enum ProductoCategoria {
  BLUSA = 'Blusas',
  PLAYERA = 'Playeras',
  VESTIDO = 'Vestidos y Palazzos',
  PANTALON = 'Pantalones y Leggings',
  SUDADERA = 'Sudaderas y Suéteres',
  CHAMARRA = 'Chamarras y Chalecos',
  SACO = 'Sacos y Túnicas',
  CONJUNTO = 'Conjuntos',
  JEAN = 'Jeans',
  PIJAMA = 'Pijamas',
  ABRIGO = 'Abrigos y Ponchos',
  FALDA = 'Faldas y Shorts',
  
}

export enum ProductoFit {
  REGULAR = 'Regular',
  SLIM = 'Slim',
  OVERSIZE = 'Oversize',
  RELAXED = 'Relaxed',
}

module.exports = (sequelize: any, DataTypes: any) => {
  class Dim_Producto extends Model<ProductoAtributos> implements ProductoAtributos {
    id_producto!: number;
    modelo_id!: number;
    descripcion!: string;
    material_principal!: string;
    porcentaje_principal!: number;
    composicion_completa!: string;
    talla!: string;
    color!: string;
    temporada!: string;
    categoria!: string;
    fit!: string;
    precio_lista!: number;

    static associate(models: any) {
      Dim_Producto.hasMany(models.Fact_Ventas, { foreignKey: 'id_producto' });
      Dim_Producto.hasMany(models.Fact_Inventario_Tienda, { foreignKey: 'id_producto' });
    }
  }

  Dim_Producto.init(
    {
      id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      modelo_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      material_principal: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      porcentaje_principal: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      composicion_completa: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      talla: {
        type: DataTypes.ENUM,
        values: Object.values(ProductoTalla),
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      temporada: {
        type: DataTypes.ENUM,
        values: Object.values(ProductoTemporada),
        allowNull: false,
      },
      categoria: {
        type: DataTypes.ENUM,
        values: Object.values(ProductoCategoria),
        allowNull: false,
      },
      fit: {
        type: DataTypes.ENUM,
        values: Object.values(ProductoFit),
        allowNull: false,
      },
      precio_lista: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: { min: 0.01 },
      },
    },
    {
      sequelize,
      modelName: 'Dim_Producto',
    }
  );

  return Dim_Producto;
};