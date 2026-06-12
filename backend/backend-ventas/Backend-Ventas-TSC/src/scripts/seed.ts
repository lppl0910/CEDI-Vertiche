// @ts-nocheck
/**
 * Script de semilla (seed) para el data warehouse de Vertiche.
 *
 * Genera y carga datos sintéticos pero realistas en las tablas:
 *   Dim_Tienda, Dim_Producto, Dim_Tiempo, Fact_Ventas y Fact_Inventario_Tienda.
 *
 * Los factores de ventas simulan comportamiento real:
 *   - Picos en Buen Fin (3.5×), Navidad (2.5×) y Día de las madres (2×).
 *   - Caída en enero–febrero (0.65×) con recuperación progresiva hacia abril.
 *   - Ajuste estacional por categoría de producto (ropa de abrigo vs ropa de calor).
 *   - Boost geográfico para estados con clima extremo y estados del centro del país.
 *   - Ticket y volumen mayores en días festivos.
 *
 * Uso (desde la carpeta Backend-Ventas-TSC):
 *   npx ts-node src/scripts/seed.ts
 */
import 'dotenv/config';
import { Sequelize, DataTypes } from 'sequelize';
import { faker } from '@faker-js/faker/locale/es_MX';
import * as fs from 'fs';

// ── CONFIG ──────────────────────────────────────────────────────────
const DB_NAME     = process.env.DB_NAME     || 'vertiche_ventas';
const DB_USER     = process.env.DB_USER     || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_HOST     = process.env.DB_HOST     || '127.0.0.1';

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: 3306,
  dialect: 'mysql',
  logging: false,
});

// ── ENUMS ────────────────────────────────────────────────────────────
const CATEGORIAS = [
  'Blusas', 'Playeras', 'Vestidos y Palazzos', 'Pantalones y Leggings',
  'Sudaderas y Suéteres', 'Chamarras y Chalecos', 'Sacos y Túnicas',
  'Conjuntos', 'Jeans', 'Pijamas', 'Abrigos y Ponchos', 'Faldas y Shorts',
];

// ── CLASIFICACIÓN DE CATEGORÍAS ──────────────────────────────────────
// Ropa abrigadora: pensada para el frío
const CATEGORIAS_FRIO = new Set([
  'Sudaderas y Suéteres',
  'Chamarras y Chalecos',
  'Abrigos y Ponchos',
]);

// Ropa de calor: prendas ligeras/cortas
const CATEGORIAS_CALOR = new Set([
  'Blusas',
  'Playeras',
  'Faldas y Shorts',
]);

// Estados con clima frío pronunciado (boost en invierno para ropa abrigadora)
const ESTADOS_FRIO_INTENSO = new Set([
  'Durango', 'Chihuahua', 'Sonora', 'Baja California', 'Zacatecas',
]);

// Estados con calor intenso (boost en verano para ropa de calor)
const ESTADOS_CALOR_INTENSO = new Set([
  'Baja California', 'Sonora', 'Coahuila', 'Sinaloa',
]);

// Estados del centro del país (ventas ~20% más altas)
const ESTADOS_CENTRO = new Set([
  'Ciudad de México', 'Estado de México', 'Morelos', 'Puebla',
  'Tlaxcala', 'Hidalgo', 'Querétaro',
]);

const TALLAS_ADULTO = ['XCH', 'CH', 'M', 'G', 'XG', 'Unitalla'];
const TALLAS_NUMERICAS = ['34', '36', '38', '40', '42'];

const TALLAS_POR_CATEGORIA: Record<string, string[]> = {
  'Blusas':                 TALLAS_ADULTO,
  'Playeras':               TALLAS_ADULTO,
  'Vestidos y Palazzos':    TALLAS_ADULTO,
  'Sudaderas y Suéteres':   TALLAS_ADULTO,
  'Chamarras y Chalecos':   TALLAS_ADULTO,
  'Sacos y Túnicas':        TALLAS_ADULTO,
  'Conjuntos':              TALLAS_ADULTO,
  'Pijamas':                TALLAS_ADULTO,
  'Abrigos y Ponchos':      TALLAS_ADULTO,
  'Faldas y Shorts':        TALLAS_ADULTO,
  'Pantalones y Leggings':  TALLAS_NUMERICAS,
  'Jeans':                  TALLAS_NUMERICAS,
};

const TEMPORADAS_PRODUCTO = ['Primavera', 'Verano', 'Otoño', 'Invierno'];

const FITS = ['Regular', 'Slim', 'Oversize', 'Relaxed'];

const MATERIALES = [
  { material: 'Poliéster', porcentaje: 100 },
  { material: 'Algodón',   porcentaje: 100 },
  { material: 'Poliéster', porcentaje: 80  },
  { material: 'Algodón',   porcentaje: 80  },
  { material: 'Viscosa',   porcentaje: 95  },
  { material: 'Lino',      porcentaje: 100 },
  { material: 'Nylon',     porcentaje: 90  },
];

const COLORES = [
  'Negro', 'Blanco', 'Rojo', 'Azul', 'Verde', 'Rosa', 'Morado',
  'Gris', 'Beige', 'Naranja', 'Amarillo', 'Café', 'Vino', 'Turquesa',
];

const MODELOS_POR_CATEGORIA: Record<string, string[]> = {
  'Blusas': [
    'BLUSA BORDADA', 'BLUSA FLORES', 'BLUSA LISA', 'BLUSA ENCAJE',
    'BLUSA MANGA LARGA', 'BLUSA CROP', 'BLUSA ESTAMPADA', 'BLUSA SATÍN',
    'BLUSA CASUAL', 'BLUSA ELEGANTE',
  ],
  'Playeras': [
    'PLAYERA BÁSICA', 'PLAYERA ESTAMPADA', 'PLAYERA BORDADA', 'PLAYERA CUELLO V',
    'PLAYERA MANGA LARGA', 'PLAYERA CROP', 'PLAYERA RAYAS', 'PLAYERA POLO',
    'PLAYERA DEPORTIVA', 'PLAYERA OVERSIZE',
  ],
  'Vestidos y Palazzos': [
    'VESTIDO CASUAL', 'VESTIDO FLORAL', 'VESTIDO LISO', 'VESTIDO FIESTA',
    'VESTIDO MIDI', 'PALAZZO LISO', 'PALAZZO ESTAMPADO', 'VESTIDO MANGA',
    'VESTIDO PLAYERO', 'VESTIDO ELEGANTE',
  ],
  'Pantalones y Leggings': [
    'PANTALÓN CASUAL', 'PANTALÓN FORMAL', 'LEGGING BÁSICO', 'LEGGING DEPORTIVO',
    'PANTALÓN WIDE LEG', 'LEGGING ESTAMPADO', 'PANTALÓN CARGO', 'PANTALÓN LINO',
    'LEGGING PUSH UP', 'PANTALÓN JOGGER',
  ],
  'Sudaderas y Suéteres': [
    'SUDADERA BÁSICA', 'SUDADERA ESTAMPADA', 'SUÉTER TEJIDO', 'SUDADERA CROP',
    'SUÉTER CUELLO ALTO', 'SUDADERA CON CAPUCHA', 'SUÉTER OVERSIZE', 'SUDADERA ZIP',
    'SUÉTER RAYAS', 'SUDADERA BORDADA',
  ],
  'Chamarras y Chalecos': [
    'CHAMARRA BOMBER', 'CHAMARRA DENIM', 'CHALECO ACOLCHADO', 'CHAMARRA CUERO',
    'CHAMARRA ROMPEVIENTOS', 'CHALECO TEJIDO', 'CHAMARRA OVERSIZE', 'CHAMARRA CARGO',
    'CHALECO POLAR', 'CHAMARRA BÁSICA',
  ],
  'Sacos y Túnicas': [
    'SACO FORMAL', 'SACO CASUAL', 'TÚNICA LARGA', 'SACO BLAZER',
    'TÚNICA ESTAMPADA', 'SACO CUADROS', 'TÚNICA LINO', 'SACO OVERSIZE',
    'TÚNICA FLORES', 'SACO ELEGANTE',
  ],
  'Conjuntos': [
    'CONJUNTO CASUAL', 'CONJUNTO DEPORTIVO', 'CONJUNTO FLORES', 'CONJUNTO BÁSICO',
    'CONJUNTO ESTAMPADO', 'CONJUNTO LINO', 'CONJUNTO CROP', 'CONJUNTO RAYAS',
    'CONJUNTO ELEGANTE', 'CONJUNTO LOUNGEWEAR',
  ],
  'Jeans': [
    'JEAN SKINNY', 'JEAN WIDE LEG', 'JEAN MOM', 'JEAN BOYFRIEND',
    'JEAN STRAIGHT', 'JEAN BOOTCUT', 'JEAN CARGO', 'JEAN HIGH WAIST',
    'JEAN DISTRESSED', 'JEAN BÁSICO',
  ],
  'Pijamas': [
    'PIJAMA ALGODÓN', 'PIJAMA SATÍN', 'PIJAMA FLORES', 'PIJAMA BÁSICA',
    'PIJAMA ESTAMPADA', 'PIJAMA TÉRMICA', 'PIJAMA CORTA', 'PIJAMA LARGA',
    'PIJAMA RAYAS', 'PIJAMA BORDADA',
  ],
  'Abrigos y Ponchos': [
    'ABRIGO LARGO', 'ABRIGO CORTO', 'PONCHO TEJIDO', 'ABRIGO LANA',
    'PONCHO FLECOS', 'ABRIGO CUADROS', 'PONCHO BÁSICO', 'ABRIGO OVERSIZE',
    'PONCHO ESTAMPADO', 'ABRIGO ELEGANTE',
  ],
  'Faldas y Shorts': [
    'FALDA MIDI', 'FALDA LARGA', 'SHORT BÁSICO', 'FALDA FLORES',
    'SHORT DENIM', 'FALDA PLISADA', 'SHORT CARGO', 'FALDA MINI',
    'SHORT DEPORTIVO', 'FALDA ESTAMPADA',
  ],
};

// Precio base por categoría
const PRECIO_BASE: Record<string, [number, number]> = {
  'Blusas':                 [199, 599],
  'Playeras':               [149, 449],
  'Vestidos y Palazzos':    [299, 899],
  'Pantalones y Leggings':  [249, 699],
  'Sudaderas y Suéteres':   [299, 799],
  'Chamarras y Chalecos':   [499, 1299],
  'Sacos y Túnicas':        [399, 999],
  'Conjuntos':              [399, 999],
  'Jeans':                  [349, 799],
  'Pijamas':                [249, 599],
  'Abrigos y Ponchos':      [599, 1499],
  'Faldas y Shorts':        [199, 599],
};

// Temporada de producto más vendida según mes
const TEMPORADA_MES: Record<number, string> = {
  1: 'Invierno', 2: 'Primavera', 3: 'Primavera',
  4: 'Primavera', 5: 'Verano', 6: 'Verano',
  7: 'Verano', 8: 'Verano', 9: 'Otoño',
  10: 'Otoño', 11: 'Invierno', 12: 'Invierno',
};

/** Devuelve la temporada comercial de Vertiche para una fecha dada. */
function temporadaComercial(mes: number, dia: number): string {
  if (mes === 1) return 'Liquidación de Temporada';
  if (mes === 5 && dia >= 1 && dia <= 15) return 'Día de las madres';
  if (mes === 11 && dia >= 15 && dia <= 20) return 'Buen Fin';
  if (mes === 12) return 'Navidad';
  if (mes >= 2 && mes <= 3) return 'Temporada Regular';
  if (mes >= 4 && mes <= 6) return 'Primavera';
  if (mes >= 7 && mes <= 9) return 'Verano';
  if (mes === 10) return 'Otoño';
  return 'Temporada Regular';
}

/** Indica si una fecha es día festivo oficial en México. */
function esFestivo(mes: number, dia: number): boolean {
  const festivos = [
    [1, 1], [2, 5], [3, 21], [5, 1], [9, 16],
    [11, 2], [11, 20], [12, 12], [12, 25],
  ];
  return festivos.some(([m, d]) => m === mes && d === dia);
}

/**
 * Factor multiplicador base de ventas según mes y día.
 * Modela picos comerciales (Buen Fin, Navidad, Día de las madres)
 * y la caída estacional de enero–febrero.
 */
function factorVentasBase(mes: number, dia: number): number {
  // Picos comerciales especiales (se mantienen sobre cualquier otra lógica)
  if (mes === 11 && dia >= 15 && dia <= 20) return 3.5; // Buen Fin
  if (mes === 12) return 2.5;                            // Navidad
  if (mes === 5 && dia >= 8 && dia <= 10) return 2.0;  // Día de las madres

  // Caída enero-febrero (~35% menos) con recuperación progresiva hacia abril
  // Enero: factor 0.65 (caída del 35%)
  if (mes === 1) return 0.65;
  // Febrero: factor 0.65 (aún bajo)
  if (mes === 2) return 0.65;
  // Marzo: recuperación parcial ~80%
  if (mes === 3) return 0.80;
  // Abril: completamente estable en 1.0
  if (mes === 4) return 1.0;

  if ([5, 6, 7].includes(mes)) return 1.3;  // Verano
  if (mes === 8) return 1.2;
  return 1.0;
}

/**
 * Factor estacional por categoría de producto y estado.
 * La ropa abrigadora vende más en invierno (boost extra en estados con frío intenso);
 * la ropa de calor vende más en verano (boost extra en estados con calor intenso).
 */
function factorCategoriaEstacional(categoria: string, mes: number, estado: string): number {
  // Determinar la estación climática del mes
  // Invierno: dic, ene, feb | Primavera: mar, abr, may | Verano: jun, jul, ago | Otoño: sep, oct, nov
  const estacion = mesAEstacion(mes);

  // ── Ropa abrigadora ──────────────────────────────────────────────
  if (CATEGORIAS_FRIO.has(categoria)) {
    // Base de invierno = 1.0; las demás estaciones son fracción de eso
    let factor = 1.0;
    if (estacion === 'Primavera') factor = 0.45;
    else if (estacion === 'Verano') factor = 1 / 3;        // ~0.333
    else if (estacion === 'Otoño') factor = 0.80;
    // else Invierno → 1.0

    // Boost en estados con invierno intenso (solo en invierno)
    if (estacion === 'Invierno' && ESTADOS_FRIO_INTENSO.has(estado)) {
      factor *= 1.40; // 40% extra en esos estados en invierno
    }
    return factor;
  }

  // ── Ropa de calor ────────────────────────────────────────────────
  if (CATEGORIAS_CALOR.has(categoria)) {
    // Base de verano = 1.0
    let factor = 1.0;
    if (estacion === 'Primavera') factor = 0.85;
    else if (estacion === 'Otoño') factor = 0.40;
    else if (estacion === 'Invierno') factor = 0.20;
    // else Verano → 1.0

    // Boost en estados con calor intenso (solo en verano)
    if (estacion === 'Verano' && ESTADOS_CALOR_INTENSO.has(estado)) {
      factor *= 1.35; // 35% extra en esos estados en verano
    }
    return factor;
  }

  // El resto de categorías no tiene ajuste estacional específico
  return 1.0;
}

/** Convierte un número de mes a la estación climática correspondiente (hemisferio norte). */
function mesAEstacion(mes: number): 'Invierno' | 'Primavera' | 'Verano' | 'Otoño' {
  if (mes === 12 || mes === 1 || mes === 2) return 'Invierno';
  if (mes >= 3 && mes <= 5) return 'Primavera';
  if (mes >= 6 && mes <= 8) return 'Verano';
  return 'Otoño'; // sep, oct, nov
}

/**
 * Factor de volumen de ventas en días festivos: entre 1.5× y 2.0× aleatorio.
 * Días normales retornan 1.0 (sin boost).
 */
function factorFestivo(mes: number, dia: number): number {
  if (esFestivo(mes, dia)) {
    // Variación entre 1.5 y 2.0
    return 1.5 + Math.random() * 0.5;
  }
  return 1.0;
}

/** Multiplicador del precio en días festivos: 1.5× (ticket ~50% más alto). */
function factorPrecioFestivo(mes: number, dia: number): number {
  return esFestivo(mes, dia) ? 1.5 : 1.0;
}

/** Boost del 20% para tiendas en estados del centro del país. */
function factorCentro(estado: string): number {
  return ESTADOS_CENTRO.has(estado) ? 1.20 : 1.0;
}

/** Factor total de ventas: producto de los cuatro factores parciales. */
function factorVentasTotal(mes: number, dia: number, categoria: string, estado: string): number {
  return (
    factorVentasBase(mes, dia) *
    factorCategoriaEstacional(categoria, mes, estado) *
    factorFestivo(mes, dia) *
    factorCentro(estado)
  );
}

// ── TIENDAS ──────────────────────────────────────────────────────────
const TIENDAS: { id: string; nombre: string; region: string; estado: string; ciudad: string; latitud: number; longitud: number }[] = [
  { id: 'V001', nombre: 'SAN ANTONIO ABAD',          region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4167, longitud: -99.1333 },
  { id: 'V003', nombre: 'PORTALES',                  region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3833, longitud: -99.1500 },
  { id: 'V007', nombre: 'TLALNEPANTLA',              region: 'Sur',   estado: 'Estado de México',   ciudad: 'Tlalnepantla',     latitud: 19.5400, longitud: -99.1950 },
  { id: 'V008', nombre: 'CHALCO',                    region: 'Sur',   estado: 'Estado de México',   ciudad: 'Chalco',           latitud: 19.2627, longitud: -98.8990 },
  { id: 'V012', nombre: 'CUAUTLA GALEANA',           region: 'Sur',   estado: 'Morelos',            ciudad: 'Cuautla',          latitud: 18.8167, longitud: -98.9500 },
  { id: 'V014', nombre: 'PUEBLA OUTLET',             region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0400, longitud: -98.2060 },
  { id: 'V015', nombre: 'ATLIXCO',                   region: 'Sur',   estado: 'Puebla',             ciudad: 'Atlixco',          latitud: 18.9118, longitud: -98.4386 },
  { id: 'V016', nombre: 'PUEBLA CENTRO 1',           region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V017', nombre: 'IZUCAR',                    region: 'Sur',   estado: 'Puebla',             ciudad: 'Izúcar',           latitud: 18.5990, longitud: -98.4640 },
  { id: 'V018', nombre: 'HUAMANTLA',                 region: 'Sur',   estado: 'Tlaxcala',           ciudad: 'Huamantla',        latitud: 19.3167, longitud: -97.9167 },
  { id: 'V019', nombre: 'ORIZABA',                   region: 'Sur',   estado: 'Veracruz',           ciudad: 'Orizaba',          latitud: 18.8500, longitud: -97.1000 },
  { id: 'V022', nombre: 'VERACRUZ',                  region: 'Sur',   estado: 'Veracruz',           ciudad: 'Veracruz',         latitud: 19.1906, longitud: -96.1559 },
  { id: 'V023', nombre: 'CHILPANCINGO',              region: 'Sur',   estado: 'Guerrero',           ciudad: 'Chilpancingo',     latitud: 17.5506, longitud: -99.5000 },
  { id: 'V024', nombre: 'ZAMORA',                    region: 'Sur',   estado: 'Michoacán',          ciudad: 'Zamora',           latitud: 19.9833, longitud: -102.2833 },
  { id: 'V025', nombre: 'URUAPAN',                   region: 'Sur',   estado: 'Michoacán',          ciudad: 'Uruapan',          latitud: 19.4167, longitud: -102.0667 },
  { id: 'V026', nombre: 'CAMPECHE 1',                region: 'Sur',   estado: 'Campeche',           ciudad: 'Campeche',         latitud: 19.8301, longitud: -90.5349 },
  { id: 'V028', nombre: 'MERIDA 1',                  region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V030', nombre: 'TUXPAN',                    region: 'Sur',   estado: 'Veracruz',           ciudad: 'Tuxpan',           latitud: 20.9544, longitud: -97.4050 },
  { id: 'V032', nombre: 'TUXTLA 1',                  region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V034', nombre: 'VILLAHERMOSA 1',            region: 'Sur',   estado: 'Tabasco',            ciudad: 'Villahermosa',     latitud: 17.9890, longitud: -92.9289 },
  { id: 'V035', nombre: 'CUAUTLA BRAVOS',            region: 'Sur',   estado: 'Morelos',            ciudad: 'Cuautla',          latitud: 18.8100, longitud: -98.9450 },
  { id: 'V037', nombre: 'APIZACO',                   region: 'Sur',   estado: 'Tlaxcala',           ciudad: 'Apizaco',          latitud: 19.4167, longitud: -98.1333 },
  { id: 'V038', nombre: 'TOLUCA',                    region: 'Sur',   estado: 'Estado de México',   ciudad: 'Toluca',           latitud: 19.2826, longitud: -99.6557 },
  { id: 'V039', nombre: 'LA PIEDAD',                 region: 'Sur',   estado: 'Michoacán',          ciudad: 'La Piedad',        latitud: 20.3500, longitud: -102.0167 },
  { id: 'V040', nombre: 'CD GUZMAN',                 region: 'Norte', estado: 'Jalisco',            ciudad: 'Cd. Guzmán',       latitud: 19.7000, longitud: -103.4667 },
  { id: 'V042', nombre: 'TAPACHULA',                 region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tapachula',        latitud: 14.9000, longitud: -92.2667 },
  { id: 'V043', nombre: 'TULANCINGO',                region: 'Sur',   estado: 'Hidalgo',            ciudad: 'Tulancingo',       latitud: 20.0833, longitud: -98.3667 },
  { id: 'V044', nombre: 'VALLARTA',                  region: 'Norte', estado: 'Jalisco',            ciudad: 'Puerto Vallarta',  latitud: 20.6534, longitud: -105.2253 },
  { id: 'V045', nombre: 'CHETUMAL',                  region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Chetumal',         latitud: 18.5001, longitud: -88.2962 },
  { id: 'V046', nombre: 'COATZACOALCOS',             region: 'Sur',   estado: 'Veracruz',           ciudad: 'Coatzacoalcos',    latitud: 18.1500, longitud: -94.4333 },
  { id: 'V047', nombre: 'TEXCOCO',                   region: 'Sur',   estado: 'Estado de México',   ciudad: 'Texcoco',          latitud: 19.5167, longitud: -98.8833 },
  { id: 'V048', nombre: 'CD DEL CARMEN 1',           region: 'Sur',   estado: 'Campeche',           ciudad: 'Cd. del Carmen',   latitud: 18.6500, longitud: -91.8333 },
  { id: 'V049', nombre: 'PLAYA DEL CARMEN 1',        region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Playa del Carmen', latitud: 20.6296, longitud: -87.0739 },
  { id: 'V050', nombre: 'VALLADOLID',                region: 'Sur',   estado: 'Yucatán',            ciudad: 'Valladolid',       latitud: 20.6892, longitud: -88.2022 },
  { id: 'V051', nombre: 'MINATITLAN',                region: 'Sur',   estado: 'Veracruz',           ciudad: 'Minatitlán',       latitud: 17.9833, longitud: -94.5500 },
  { id: 'V052', nombre: 'MERIDA 3',                  region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V053', nombre: 'CHETUMAL 2',                region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Chetumal',         latitud: 18.5001, longitud: -88.2962 },
  { id: 'V054', nombre: 'CARDENAS',                  region: 'Sur',   estado: 'Tabasco',            ciudad: 'Cárdenas',         latitud: 18.0000, longitud: -93.3667 },
  { id: 'V055', nombre: 'ACAPULCO',                  region: 'Sur',   estado: 'Guerrero',           ciudad: 'Acapulco',         latitud: 16.8531, longitud: -99.8238 },
  { id: 'V056', nombre: 'GUADALAJARA',               region: 'Norte', estado: 'Jalisco',            ciudad: 'Guadalajara',      latitud: 20.6597, longitud: -103.3496 },
  { id: 'V057', nombre: 'XALAPA',                    region: 'Sur',   estado: 'Veracruz',           ciudad: 'Xalapa',           latitud: 19.5438, longitud: -96.9102 },
  { id: 'V058', nombre: 'TAMPICO',                   region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Tampico',          latitud: 22.2333, longitud: -97.8667 },
  { id: 'V059', nombre: 'PALENQUE',                  region: 'Sur',   estado: 'Chiapas',            ciudad: 'Palenque',         latitud: 17.5167, longitud: -91.9833 },
  { id: 'V060', nombre: 'CAMPECHE 2',                region: 'Sur',   estado: 'Campeche',           ciudad: 'Campeche',         latitud: 19.8301, longitud: -90.5349 },
  { id: 'V061', nombre: 'VILLAHERMOSA 2',            region: 'Sur',   estado: 'Tabasco',            ciudad: 'Villahermosa',     latitud: 17.9890, longitud: -92.9289 },
  { id: 'V062', nombre: 'GUADALAJARA 2',             region: 'Norte', estado: 'Jalisco',            ciudad: 'Guadalajara',      latitud: 20.6597, longitud: -103.3496 },
  { id: 'V063', nombre: 'TEPIC',                     region: 'Norte', estado: 'Nayarit',            ciudad: 'Tepic',            latitud: 21.5042, longitud: -104.8954 },
  { id: 'V064', nombre: 'ACAPULCO 2',                region: 'Sur',   estado: 'Guerrero',           ciudad: 'Acapulco',         latitud: 16.8531, longitud: -99.8238 },
  { id: 'V065', nombre: 'CANCUN CENTRO',             region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cancún',           latitud: 21.1619, longitud: -86.8515 },
  { id: 'V066', nombre: 'CANCUN AMERICAS',           region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cancún',           latitud: 21.1619, longitud: -86.8515 },
  { id: 'V067', nombre: 'LEON',                      region: 'Norte', estado: 'Guanajuato',         ciudad: 'León',             latitud: 21.1220, longitud: -101.6820 },
  { id: 'V068', nombre: 'COMALCALCO',                region: 'Sur',   estado: 'Tabasco',            ciudad: 'Comalcalco',       latitud: 18.2667, longitud: -93.2167 },
  { id: 'V069', nombre: 'TEPIC 2',                   region: 'Norte', estado: 'Nayarit',            ciudad: 'Tepic',            latitud: 21.5042, longitud: -104.8954 },
  { id: 'V070', nombre: 'MANZANILLO',                region: 'Norte', estado: 'Colima',             ciudad: 'Manzanillo',       latitud: 19.0500, longitud: -104.3167 },
  { id: 'V071', nombre: 'CANCUN MALL',               region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cancún',           latitud: 21.1619, longitud: -86.8515 },
  { id: 'V072', nombre: 'CANCUN 2000',               region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cancún',           latitud: 21.1619, longitud: -86.8515 },
  { id: 'V073', nombre: 'MERIDA 4',                  region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V074', nombre: 'PUEBLA CENTRO 2',           region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V075', nombre: 'CD DEL CARMEN 2',           region: 'Sur',   estado: 'Campeche',           ciudad: 'Cd. del Carmen',   latitud: 18.6500, longitud: -91.8333 },
  { id: 'V076', nombre: 'TUXTLA 2',                  region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V077', nombre: 'MACUSPANA',                 region: 'Sur',   estado: 'Tabasco',            ciudad: 'Macuspana',        latitud: 17.7667, longitud: -92.4667 },
  { id: 'V078', nombre: 'MERIDA 5',                  region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V079', nombre: 'MINATITLAN 3',              region: 'Sur',   estado: 'Veracruz',           ciudad: 'Minatitlán',       latitud: 17.9833, longitud: -94.5500 },
  { id: 'V080', nombre: 'PLAYA DEL CARMEN 2',        region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Playa del Carmen', latitud: 20.6296, longitud: -87.0739 },
  { id: 'V081', nombre: 'PASEO COATZACOALCOS',       region: 'Sur',   estado: 'Veracruz',           ciudad: 'Coatzacoalcos',    latitud: 18.1500, longitud: -94.4333 },
  { id: 'V082', nombre: 'QUERETARO',                 region: 'Norte', estado: 'Querétaro',          ciudad: 'Querétaro',        latitud: 20.5888, longitud: -100.3899 },
  { id: 'V083', nombre: 'SAN LUIS POTOSI',           region: 'Norte', estado: 'San Luis Potosí',    ciudad: 'San Luis Potosí',  latitud: 22.1565, longitud: -100.9855 },
  { id: 'V084', nombre: 'CUERNAVACA',                region: 'Sur',   estado: 'Morelos',            ciudad: 'Cuernavaca',       latitud: 18.9242, longitud: -99.2216 },
  { id: 'V085', nombre: 'COLIMA',                    region: 'Norte', estado: 'Colima',             ciudad: 'Colima',           latitud: 19.2433, longitud: -103.7241 },
  { id: 'V086', nombre: 'TLAXCALA',                  region: 'Sur',   estado: 'Tlaxcala',           ciudad: 'Tlaxcala',         latitud: 19.3167, longitud: -98.2333 },
  { id: 'V087', nombre: 'TUXTLA 3',                  region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V088', nombre: 'DURANGO',                   region: 'Norte', estado: 'Durango',            ciudad: 'Durango',          latitud: 24.0226, longitud: -104.6578 },
  { id: 'V089', nombre: 'CHIHUAHUA',                 region: 'Norte', estado: 'Chihuahua',          ciudad: 'Chihuahua',        latitud: 28.6353, longitud: -106.0889 },
  { id: 'V090', nombre: 'CAMPECHE 3',                region: 'Sur',   estado: 'Campeche',           ciudad: 'Campeche',         latitud: 19.8301, longitud: -90.5349 },
  { id: 'V091', nombre: 'OAXACA',                    region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V092', nombre: 'TAMPICO PASEO',             region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Tampico',          latitud: 22.2333, longitud: -97.8667 },
  { id: 'V093', nombre: 'AGUASCALIENTES',            region: 'Norte', estado: 'Aguascalientes',     ciudad: 'Aguascalientes',   latitud: 21.8818, longitud: -102.2916 },
  { id: 'V094', nombre: 'CAMPECHE PLAZA',            region: 'Sur',   estado: 'Campeche',           ciudad: 'Campeche',         latitud: 19.8301, longitud: -90.5349 },
  { id: 'V095', nombre: 'HUIXTLA',                   region: 'Sur',   estado: 'Chiapas',            ciudad: 'Huixtla',          latitud: 15.1333, longitud: -92.4667 },
  { id: 'V096', nombre: 'TEHUACAN',                  region: 'Sur',   estado: 'Puebla',             ciudad: 'Tehuacán',         latitud: 18.4619, longitud: -97.3917 },
  { id: 'V097', nombre: 'TUXTLA PLAZA DEL SOL',      region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V098', nombre: 'JOJUTLA',                   region: 'Sur',   estado: 'Morelos',            ciudad: 'Jojutla',          latitud: 18.6167, longitud: -99.1833 },
  { id: 'V099', nombre: 'PACHUCA',                   region: 'Sur',   estado: 'Hidalgo',            ciudad: 'Pachuca',          latitud: 20.1167, longitud: -98.7333 },
  { id: 'V100', nombre: 'ZACATECAS',                 region: 'Norte', estado: 'Zacatecas',          ciudad: 'Zacatecas',        latitud: 22.7709, longitud: -102.5832 },
  { id: 'V101', nombre: 'TUXTEPEC',                  region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Tuxtepec',         latitud: 18.0833, longitud: -96.1167 },
  { id: 'V102', nombre: 'CORDOBA 2',                 region: 'Sur',   estado: 'Veracruz',           ciudad: 'Córdoba',          latitud: 18.8833, longitud: -96.9333 },
  { id: 'V103', nombre: 'HUIMANGUILLO',              region: 'Sur',   estado: 'Tabasco',            ciudad: 'Huimanguillo',     latitud: 17.8333, longitud: -93.3833 },
  { id: 'V104', nombre: 'PARRAL',                    region: 'Norte', estado: 'Chihuahua',          ciudad: 'Parral',           latitud: 26.9333, longitud: -105.6667 },
  { id: 'V105', nombre: 'SALTILLO',                  region: 'Norte', estado: 'Coahuila',           ciudad: 'Saltillo',         latitud: 25.4167, longitud: -101.0000 },
  { id: 'V106', nombre: 'PLAZA ARAGON 2',            region: 'Sur',   estado: 'Estado de México',   ciudad: 'Ecatepec',         latitud: 19.6000, longitud: -99.0333 },
  { id: 'V107', nombre: 'PLAZA ARAGON 1',            region: 'Sur',   estado: 'Estado de México',   ciudad: 'Ecatepec',         latitud: 19.6000, longitud: -99.0333 },
  { id: 'V108', nombre: 'COZUMEL',                   region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cozumel',          latitud: 20.5083, longitud: -86.9458 },
  { id: 'V109', nombre: 'QUERETARO 2',               region: 'Norte', estado: 'Querétaro',          ciudad: 'Querétaro',        latitud: 20.5888, longitud: -100.3899 },
  { id: 'V110', nombre: 'POZA RICA',                 region: 'Sur',   estado: 'Veracruz',           ciudad: 'Poza Rica',        latitud: 20.5333, longitud: -97.4500 },
  { id: 'V111', nombre: 'XALAPA PASEO',              region: 'Sur',   estado: 'Veracruz',           ciudad: 'Xalapa',           latitud: 19.5438, longitud: -96.9102 },
  { id: 'V112', nombre: 'OAXACA 2',                  region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V113', nombre: 'POZA RICA PASEO',           region: 'Sur',   estado: 'Veracruz',           ciudad: 'Poza Rica',        latitud: 20.5333, longitud: -97.4500 },
  { id: 'V114', nombre: 'TAPACHULA 2',               region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tapachula',        latitud: 14.9000, longitud: -92.2667 },
  { id: 'V115', nombre: 'PUEBLA PASEO 2',            region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V116', nombre: 'VILLAHERMOSA 3',            region: 'Sur',   estado: 'Tabasco',            ciudad: 'Villahermosa',     latitud: 17.9890, longitud: -92.9289 },
  { id: 'V117', nombre: 'OUTLET LERMA',              region: 'Sur',   estado: 'Estado de México',   ciudad: 'Lerma',            latitud: 19.2833, longitud: -99.8833 },
  { id: 'V118', nombre: 'FORUM COATZACOALCOS',       region: 'Sur',   estado: 'Veracruz',           ciudad: 'Coatzacoalcos',    latitud: 18.1500, longitud: -94.4333 },
  { id: 'V119', nombre: 'CULIACAN',                  region: 'Norte', estado: 'Sinaloa',            ciudad: 'Culiacán',         latitud: 24.7994, longitud: -107.3879 },
  { id: 'V120', nombre: 'GUADALAJARA 3',             region: 'Norte', estado: 'Jalisco',            ciudad: 'Guadalajara',      latitud: 20.6597, longitud: -103.3496 },
  { id: 'V121', nombre: 'MORELIA',                   region: 'Sur',   estado: 'Michoacán',          ciudad: 'Morelia',          latitud: 19.7060, longitud: -101.1950 },
  { id: 'V122', nombre: 'ACAYUCAN',                  region: 'Sur',   estado: 'Veracruz',           ciudad: 'Acayucan',         latitud: 17.9500, longitud: -94.9167 },
  { id: 'V123', nombre: 'OAXACA 3',                  region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V124', nombre: 'MONTERREY',                 region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V125', nombre: 'VERACRUZ PASEO',            region: 'Sur',   estado: 'Veracruz',           ciudad: 'Veracruz',         latitud: 19.1906, longitud: -96.1559 },
  { id: 'V126', nombre: 'DELICIAS',                  region: 'Norte', estado: 'Chihuahua',          ciudad: 'Delicias',         latitud: 28.1833, longitud: -105.4667 },
  { id: 'V127', nombre: 'PUEBLA REFORMA',            region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V128', nombre: 'MERIDA 6',                  region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V129', nombre: '16 DE SEPTIEMBRE',          region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4326, longitud: -99.1332 },
  { id: 'V130', nombre: 'COMITAN',                   region: 'Sur',   estado: 'Chiapas',            ciudad: 'Comitán',          latitud: 16.2500, longitud: -92.1333 },
  { id: 'V131', nombre: 'SAN LUIS POTOSI 2',         region: 'Norte', estado: 'San Luis Potosí',    ciudad: 'San Luis Potosí',  latitud: 22.1565, longitud: -100.9855 },
  { id: 'V132', nombre: 'CORDOBA 1',                 region: 'Sur',   estado: 'Veracruz',           ciudad: 'Córdoba',          latitud: 18.8833, longitud: -96.9333 },
  { id: 'V133', nombre: 'PACHUCA 3',                 region: 'Sur',   estado: 'Hidalgo',            ciudad: 'Pachuca',          latitud: 20.1167, longitud: -98.7333 },
  { id: 'V134', nombre: 'COSMOPOL COACALCO',         region: 'Sur',   estado: 'Estado de México',   ciudad: 'Coacalco',         latitud: 19.6333, longitud: -99.0833 },
  { id: 'V135', nombre: 'PLAZA OAXACA',              region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V136', nombre: 'TUXTLA CENTRO',             region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V137', nombre: 'LOS CABOS',                 region: 'Norte', estado: 'Baja California Sur',ciudad: 'Los Cabos',        latitud: 22.8905, longitud: -109.9167 },
  { id: 'V138', nombre: 'VERACRUZ PLAZA LAS A',      region: 'Sur',   estado: 'Veracruz',           ciudad: 'Veracruz',         latitud: 19.1906, longitud: -96.1559 },
  { id: 'V139', nombre: 'GUANAJUATO',                region: 'Norte', estado: 'Guanajuato',         ciudad: 'Guanajuato',       latitud: 21.0190, longitud: -101.2574 },
  { id: 'V140', nombre: 'XOCHIMILCO',                region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.2570, longitud: -99.1027 },
  { id: 'V141', nombre: 'SAN ANGEL',                 region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3467, longitud: -99.1903 },
  { id: 'V142', nombre: 'MAZATLAN',                  region: 'Norte', estado: 'Sinaloa',            ciudad: 'Mazatlán',         latitud: 23.2494, longitud: -106.4111 },
  { id: 'V143', nombre: 'TAMPICO 3',                 region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Tampico',          latitud: 22.2333, longitud: -97.8667 },
  { id: 'V144', nombre: 'MERIDA AMERICAS',           region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V145', nombre: 'ORIZABA 2',                 region: 'Sur',   estado: 'Veracruz',           ciudad: 'Orizaba',          latitud: 18.8500, longitud: -97.1000 },
  { id: 'V146', nombre: 'ORIZABA PLAZA',             region: 'Sur',   estado: 'Veracruz',           ciudad: 'Orizaba',          latitud: 18.8500, longitud: -97.1000 },
  { id: 'V147', nombre: 'LA PAZ CENTRO',             region: 'Norte', estado: 'Baja California Sur',ciudad: 'La Paz',           latitud: 24.1426, longitud: -110.3128 },
  { id: 'V148', nombre: 'AZCAPOTZALCO',              region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4833, longitud: -99.1833 },
  { id: 'V149', nombre: 'TACUBA',                    region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4500, longitud: -99.1833 },
  { id: 'V150', nombre: 'PLAZA TLALNEPANTLA',        region: 'Sur',   estado: 'Estado de México',   ciudad: 'Tlalnepantla',     latitud: 19.5400, longitud: -99.1950 },
  { id: 'V151', nombre: 'OAXACA 4',                  region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V152', nombre: 'NAUCALPAN',                 region: 'Sur',   estado: 'Estado de México',   ciudad: 'Naucalpan',        latitud: 19.4833, longitud: -99.2333 },
  { id: 'V153', nombre: 'FRESNILLO',                 region: 'Norte', estado: 'Zacatecas',          ciudad: 'Fresnillo',        latitud: 23.1667, longitud: -102.8667 },
  { id: 'V154', nombre: 'TACUBAYA',                  region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4000, longitud: -99.1833 },
  { id: 'V155', nombre: 'LA CUSPIDE',                region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3667, longitud: -99.1833 },
  { id: 'V156', nombre: 'HERMOSILLO',                region: 'Norte', estado: 'Sonora',             ciudad: 'Hermosillo',       latitud: 29.0729, longitud: -110.9559 },
  { id: 'V157', nombre: 'JUCHITAN',                  region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Juchitán',         latitud: 16.4333, longitud: -95.0167 },
  { id: 'V158', nombre: 'CUAUTLA DE LOS ATRIOS',     region: 'Sur',   estado: 'Morelos',            ciudad: 'Cuautla',          latitud: 18.8167, longitud: -98.9500 },
  { id: 'V159', nombre: 'SAN CRISTOBAL DE LAS',      region: 'Sur',   estado: 'Chiapas',            ciudad: 'San Cristóbal',    latitud: 16.7369, longitud: -92.6370 },
  { id: 'V160', nombre: 'TECAMAC',                   region: 'Sur',   estado: 'Estado de México',   ciudad: 'Tecámac',          latitud: 19.7167, longitud: -98.9667 },
  { id: 'V161', nombre: 'TAMPICO 4',                 region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Tampico',          latitud: 22.2333, longitud: -97.8667 },
  { id: 'V162', nombre: 'ZONA ROSA',                 region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4280, longitud: -99.1680 },
  { id: 'V163', nombre: 'PLAZA CONDESA',             region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4120, longitud: -99.1760 },
  { id: 'V164', nombre: 'PLAZA CENTRAL',             region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3667, longitud: -99.1000 },
  { id: 'V165', nombre: 'PUEBLA SAN FRANCISCO',      region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V166', nombre: 'TEXCOCO PLAZA PUERTA',      region: 'Sur',   estado: 'Estado de México',   ciudad: 'Texcoco',          latitud: 19.5167, longitud: -98.8833 },
  { id: 'V167', nombre: 'PASEO TUXTLA',              region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V168', nombre: 'TULA HIDALGO',              region: 'Sur',   estado: 'Hidalgo',            ciudad: 'Tula',             latitud: 20.0500, longitud: -99.3333 },
  { id: 'V169', nombre: 'VALLE OAXACA',              region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V170', nombre: 'TULUM',                     region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Tulum',            latitud: 20.2114, longitud: -87.4654 },
  { id: 'V171', nombre: 'CANCUN PLAZA HEROES',       region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cancún',           latitud: 21.1619, longitud: -86.8515 },
  { id: 'V172', nombre: 'PASEO VERTICHE MORELOS',    region: 'Sur',   estado: 'Morelos',            ciudad: 'Cuernavaca',       latitud: 18.9242, longitud: -99.2216 },
  { id: 'V173', nombre: 'SANTA ANA TLAXCALA',        region: 'Sur',   estado: 'Tlaxcala',           ciudad: 'Santa Ana',        latitud: 19.3000, longitud: -98.2000 },
  { id: 'V174', nombre: 'PASEO VERTICHE LEON',       region: 'Norte', estado: 'Guanajuato',         ciudad: 'León',             latitud: 21.1220, longitud: -101.6820 },
  { id: 'V175', nombre: 'ACAPULCO REMATES',          region: 'Sur',   estado: 'Guerrero',           ciudad: 'Acapulco',         latitud: 16.8531, longitud: -99.8238 },
  { id: 'V176', nombre: 'PARQUE CELAYA GTO',         region: 'Norte', estado: 'Guanajuato',         ciudad: 'Celaya',           latitud: 20.5236, longitud: -100.8153 },
  { id: 'V177', nombre: 'PATIO CHALCO',              region: 'Sur',   estado: 'Estado de México',   ciudad: 'Chalco',           latitud: 19.2627, longitud: -98.8990 },
  { id: 'V178', nombre: 'ESPACIO AGUASCALIENTES',    region: 'Norte', estado: 'Aguascalientes',     ciudad: 'Aguascalientes',   latitud: 21.8818, longitud: -102.2916 },
  { id: 'V179', nombre: 'PATIO HERMOSILLO',          region: 'Norte', estado: 'Sonora',             ciudad: 'Hermosillo',       latitud: 29.0729, longitud: -110.9559 },
  { id: 'V180', nombre: 'CD VICTORIA TAMAULIPAS',    region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Cd. Victoria',     latitud: 23.7369, longitud: -99.1411 },
  { id: 'V181', nombre: 'PATIO TOLUCA',              region: 'Sur',   estado: 'Estado de México',   ciudad: 'Toluca',           latitud: 19.2826, longitud: -99.6557 },
  { id: 'V182', nombre: 'TEAPA',                     region: 'Sur',   estado: 'Tabasco',            ciudad: 'Teapa',            latitud: 17.5500, longitud: -92.9500 },
  { id: 'V183', nombre: 'CARDENAS 2',                region: 'Sur',   estado: 'Tabasco',            ciudad: 'Cárdenas',         latitud: 18.0000, longitud: -93.3667 },
  { id: 'V184', nombre: 'MULTIPLAZA TUXTEPEC',       region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Tuxtepec',         latitud: 18.0833, longitud: -96.1167 },
  { id: 'V185', nombre: 'LOS MOCHIS SINALOA',        region: 'Norte', estado: 'Sinaloa',            ciudad: 'Los Mochis',       latitud: 25.7906, longitud: -108.9870 },
  { id: 'V186', nombre: 'PLAZA BELLA OAXACA',        region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Oaxaca',           latitud: 17.0654, longitud: -96.7236 },
  { id: 'V187', nombre: 'MULTIPLAZA ARCO NORTE',     region: 'Sur',   estado: 'Estado de México',   ciudad: 'Tultitlán',        latitud: 19.6500, longitud: -99.1667 },
  { id: 'V188', nombre: 'IGUALA',                    region: 'Sur',   estado: 'Guerrero',           ciudad: 'Iguala',           latitud: 18.3500, longitud: -99.5333 },
  { id: 'V189', nombre: 'PLAZA CRISTAL',             region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4326, longitud: -99.1332 },
  { id: 'V190', nombre: 'CUERNAVACA 2',              region: 'Sur',   estado: 'Morelos',            ciudad: 'Cuernavaca',       latitud: 18.9242, longitud: -99.2216 },
  { id: 'V191', nombre: 'UNIVERSIDAD CDMX',          region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3326, longitud: -99.1832 },
  { id: 'V192', nombre: 'SAN CRISTOBAL DE LAS',      region: 'Sur',   estado: 'Chiapas',            ciudad: 'San Cristóbal',    latitud: 16.7369, longitud: -92.6370 },
  { id: 'V193', nombre: 'PLAZA CHIMALHUACAN',        region: 'Sur',   estado: 'Estado de México',   ciudad: 'Chimalhuacán',     latitud: 19.4167, longitud: -98.9500 },
  { id: 'V194', nombre: 'CD MANTE',                  region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Cd. Mante',        latitud: 22.7333, longitud: -98.9667 },
  { id: 'V195', nombre: 'ARAGON 3',                  region: 'Sur',   estado: 'Estado de México',   ciudad: 'Ecatepec',         latitud: 19.6000, longitud: -99.0333 },
  { id: 'V196', nombre: 'MONTERREY 2',               region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V197', nombre: 'CD VALLES SAN LUIS',        region: 'Norte', estado: 'San Luis Potosí',    ciudad: 'Cd. Valles',       latitud: 21.9958, longitud: -99.0175 },
  { id: 'V198', nombre: 'SALINA CRUZ OAXACA',        region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Salina Cruz',      latitud: 16.1833, longitud: -95.2000 },
  { id: 'V199', nombre: 'PINO SUAREZ',               region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4270, longitud: -99.1330 },
  { id: 'V200', nombre: 'CANCUN MALL 2',             region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Cancún',           latitud: 21.1619, longitud: -86.8515 },
  { id: 'V201', nombre: 'PLAZA AMERICAS MORELIA',    region: 'Sur',   estado: 'Michoacán',          ciudad: 'Morelia',          latitud: 19.7060, longitud: -101.1950 },
  { id: 'V202', nombre: 'TORREON EN EL PORTAL',      region: 'Norte', estado: 'Coahuila',           ciudad: 'Torreón',          latitud: 25.5428, longitud: -103.4068 },
  { id: 'V203', nombre: 'APATZINGAN',                region: 'Sur',   estado: 'Michoacán',          ciudad: 'Apatzingán',       latitud: 19.0833, longitud: -102.3500 },
  { id: 'V204', nombre: 'IRAPUATO',                  region: 'Norte', estado: 'Guanajuato',         ciudad: 'Irapuato',         latitud: 20.6743, longitud: -101.3574 },
  { id: 'V205', nombre: 'CD OBREGON',                region: 'Norte', estado: 'Sonora',             ciudad: 'Cd. Obregón',      latitud: 27.4863, longitud: -109.9307 },
  { id: 'V206', nombre: 'NOGALES',                   region: 'Norte', estado: 'Sonora',             ciudad: 'Nogales',          latitud: 31.3000, longitud: -110.9333 },
  { id: 'V207', nombre: 'HERMOSILLO 3',              region: 'Norte', estado: 'Sonora',             ciudad: 'Hermosillo',       latitud: 29.0729, longitud: -110.9559 },
  { id: 'V208', nombre: 'CHETUMAL 3',                region: 'Sur',   estado: 'Quintana Roo',       ciudad: 'Chetumal',         latitud: 18.5001, longitud: -88.2962 },
  { id: 'V209', nombre: 'MONTERREY 3',               region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V210', nombre: 'CULIACAN PASEO',            region: 'Norte', estado: 'Sinaloa',            ciudad: 'Culiacán',         latitud: 24.7994, longitud: -107.3879 },
  { id: 'V211', nombre: 'MEXICALI SENDERO',          region: 'Norte', estado: 'Baja California',    ciudad: 'Mexicali',         latitud: 32.6245, longitud: -115.4523 },
  { id: 'V212', nombre: 'CHOLULA',                   region: 'Sur',   estado: 'Puebla',             ciudad: 'Cholula',          latitud: 19.0633, longitud: -98.3050 },
  { id: 'V213', nombre: 'FRESNILLO',                 region: 'Norte', estado: 'Zacatecas',          ciudad: 'Fresnillo',        latitud: 23.1667, longitud: -102.8667 },
  { id: 'V214', nombre: 'AGUASCALIENTES 3',          region: 'Norte', estado: 'Aguascalientes',     ciudad: 'Aguascalientes',   latitud: 21.8818, longitud: -102.2916 },
  { id: 'V215', nombre: 'CULIACAN SENDERO',          region: 'Norte', estado: 'Sinaloa',            ciudad: 'Culiacán',         latitud: 24.7994, longitud: -107.3879 },
  { id: 'V216', nombre: 'SAN JUAN DEL RIO',          region: 'Norte', estado: 'Querétaro',          ciudad: 'San Juan del Río', latitud: 20.3892, longitud: -100.0000 },
  { id: 'V217', nombre: 'VILLAFLORES CHIAPAS',       region: 'Sur',   estado: 'Chiapas',            ciudad: 'Villaflores',      latitud: 16.2333, longitud: -93.2667 },
  { id: 'V218', nombre: 'MATAMOROS',                 region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Matamoros',        latitud: 25.8695, longitud: -97.5027 },
  { id: 'V219', nombre: 'CABORCA SONORA',            region: 'Norte', estado: 'Sonora',             ciudad: 'Caborca',          latitud: 30.7167, longitud: -112.1500 },
  { id: 'V220', nombre: 'TAMAZUNCHALE',              region: 'Norte', estado: 'San Luis Potosí',    ciudad: 'Tamazunchale',     latitud: 21.2667, longitud: -98.7833 },
  { id: 'V221', nombre: 'ERMITA',                    region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3667, longitud: -99.1500 },
  { id: 'V222', nombre: 'TIERRA BLANCA',             region: 'Sur',   estado: 'Veracruz',           ciudad: 'Tierra Blanca',    latitud: 18.4500, longitud: -96.3500 },
  { id: 'V223', nombre: 'GUASAVE SINALOA',           region: 'Norte', estado: 'Sinaloa',            ciudad: 'Guasave',          latitud: 25.5667, longitud: -108.4667 },
  { id: 'V224', nombre: 'MARTINEZ DE LA TORRE',      region: 'Sur',   estado: 'Veracruz',           ciudad: 'Martínez de la Torre', latitud: 20.0667, longitud: -97.0500 },
  { id: 'V225', nombre: 'COSAMALOAPAN',              region: 'Sur',   estado: 'Veracruz',           ciudad: 'Cosamaloapan',     latitud: 18.3667, longitud: -95.8000 },
  { id: 'V226', nombre: 'SAN JOSE DEL CABO BCS',     region: 'Norte', estado: 'Baja California Sur',ciudad: 'San José del Cabo',latitud: 23.0597, longitud: -109.6917 },
  { id: 'V227', nombre: 'PINO SUAREZ',               region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4270, longitud: -99.1330 },
  { id: 'V228', nombre: 'PINOTEPAN OAXACA',          region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Pinotepa Nacional',latitud: 16.3333, longitud: -98.0500 },
  { id: 'V229', nombre: 'SAN ANDRES TUXTLA',         region: 'Sur',   estado: 'Veracruz',           ciudad: 'San Andrés Tuxtla',latitud: 18.4500, longitud: -95.2167 },
  { id: 'V230', nombre: 'TIJUANA',                   region: 'Norte', estado: 'Baja California',    ciudad: 'Tijuana',          latitud: 32.5027, longitud: -117.0039 },
  { id: 'V231', nombre: 'TECOMAN',                   region: 'Norte', estado: 'Colima',             ciudad: 'Tecomán',          latitud: 18.9000, longitud: -103.8667 },
  { id: 'V232', nombre: 'PIEDRAS NEGRAS',            region: 'Norte', estado: 'Coahuila',           ciudad: 'Piedras Negras',   latitud: 28.7000, longitud: -100.5167 },
  { id: 'V233', nombre: 'PLAZA TEPEYAC',             region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4833, longitud: -99.1167 },
  { id: 'V234', nombre: 'NAVOJOA',                   region: 'Norte', estado: 'Sonora',             ciudad: 'Navojoa',          latitud: 27.0833, longitud: -109.4500 },
  { id: 'V235', nombre: 'CD ACUÑA',                  region: 'Norte', estado: 'Coahuila',           ciudad: 'Cd. Acuña',        latitud: 29.3167, longitud: -101.0833 },
  { id: 'V236', nombre: 'GUAMUCHIL',                 region: 'Norte', estado: 'Sinaloa',            ciudad: 'Guamúchil',        latitud: 25.4500, longitud: -108.0833 },
  { id: 'V237', nombre: 'MERIDA 7',                  region: 'Sur',   estado: 'Yucatán',            ciudad: 'Mérida',           latitud: 20.9674, longitud: -89.6233 },
  { id: 'V238', nombre: 'ALTAMIRA',                  region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Altamira',         latitud: 22.3833, longitud: -97.9167 },
  { id: 'V239', nombre: 'ZUMPANGO',                  region: 'Sur',   estado: 'Estado de México',   ciudad: 'Zumpango',         latitud: 19.7833, longitud: -99.1000 },
  { id: 'V240', nombre: 'ZIHUATANEJO',               region: 'Sur',   estado: 'Guerrero',           ciudad: 'Zihuatanejo',      latitud: 17.6392, longitud: -101.5547 },
  { id: 'V241', nombre: 'ACAPULCO RENACIMIENTO',     region: 'Sur',   estado: 'Guerrero',           ciudad: 'Acapulco',         latitud: 16.8531, longitud: -99.8238 },
  { id: 'V242', nombre: 'TEZIUTLAN',                 region: 'Sur',   estado: 'Puebla',             ciudad: 'Teziutlán',        latitud: 19.8167, longitud: -97.3500 },
  { id: 'V243', nombre: 'TONALA',                    region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tonalá',           latitud: 16.0833, longitud: -93.7500 },
  { id: 'V244', nombre: 'NUEVO LAREDO',              region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Nuevo Laredo',     latitud: 27.4760, longitud: -99.5160 },
  { id: 'V245', nombre: 'OMETEPEC',                  region: 'Sur',   estado: 'Guerrero',           ciudad: 'Ometepec',         latitud: 16.6833, longitud: -98.4000 },
  { id: 'V246', nombre: 'CETRAM ROSARIO',            region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3167, longitud: -99.1667 },
  { id: 'V247', nombre: 'MADERO',                    region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Cd. Madero',       latitud: 22.2667, longitud: -97.8333 },
  { id: 'V248', nombre: 'EJE CENTRAL',               region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4326, longitud: -99.1332 },
  { id: 'V249', nombre: 'CELAYA CENTRO',             region: 'Norte', estado: 'Guanajuato',         ciudad: 'Celaya',           latitud: 20.5236, longitud: -100.8153 },
  { id: 'V250', nombre: 'SALAMANCA',                 region: 'Norte', estado: 'Guanajuato',         ciudad: 'Salamanca',        latitud: 20.5706, longitud: -101.1953 },
  { id: 'V251', nombre: 'ENSENADA',                  region: 'Norte', estado: 'Baja California',    ciudad: 'Ensenada',         latitud: 31.8667, longitud: -116.5961 },
  { id: 'V252', nombre: 'TIJUANA CENTRO 2',          region: 'Norte', estado: 'Baja California',    ciudad: 'Tijuana',          latitud: 32.5027, longitud: -117.0039 },
  { id: 'V253', nombre: 'ROSARITO',                  region: 'Norte', estado: 'Baja California',    ciudad: 'Rosarito',         latitud: 32.3333, longitud: -117.0667 },
  { id: 'V254', nombre: 'CALZADA ERMITA',            region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.3667, longitud: -99.1500 },
  { id: 'V255', nombre: 'PANUCO',                    region: 'Sur',   estado: 'Veracruz',           ciudad: 'Pánuco',           latitud: 22.0500, longitud: -98.1833 },
  { id: 'V256', nombre: 'MULTIPLAZA ARAGON',         region: 'Sur',   estado: 'Estado de México',   ciudad: 'Ecatepec',         latitud: 19.6000, longitud: -99.0333 },
  { id: 'V257', nombre: 'ENCUENTRO OCEANIA',         region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4667, longitud: -99.1000 },
  { id: 'V258', nombre: 'LAZARO CARDENAS',           region: 'Sur',   estado: 'Michoacán',          ciudad: 'Lázaro Cárdenas',  latitud: 17.9500, longitud: -102.2000 },
  { id: 'V259', nombre: 'AMERICAS ECATEPEC',         region: 'Sur',   estado: 'Estado de México',   ciudad: 'Ecatepec',         latitud: 19.6000, longitud: -99.0333 },
  { id: 'V260', nombre: 'TACUBAYA SALDOS',           region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4000, longitud: -99.1833 },
  { id: 'V261', nombre: 'MONCLOVA COAHUILA',         region: 'Norte', estado: 'Coahuila',           ciudad: 'Monclova',         latitud: 26.9000, longitud: -101.4167 },
  { id: 'V262', nombre: 'PLAZA DORADA PUEBLA',       region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V263', nombre: 'SENDERO JUAREZ',            region: 'Norte', estado: 'Chihuahua',          ciudad: 'Cd. Juárez',       latitud: 31.6904, longitud: -106.4245 },
  { id: 'V264', nombre: 'TANTOYUCA VER',             region: 'Sur',   estado: 'Veracruz',           ciudad: 'Tantoyuca',        latitud: 21.3500, longitud: -98.2333 },
  { id: 'V265', nombre: 'SENDERO LA FE MTY',         region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V266', nombre: 'SENDERO LOS MOCHIS',        region: 'Norte', estado: 'Sinaloa',            ciudad: 'Los Mochis',       latitud: 25.7906, longitud: -108.9870 },
  { id: 'V267', nombre: 'SENDERO SALTILLO SUR',      region: 'Norte', estado: 'Coahuila',           ciudad: 'Saltillo',         latitud: 25.4167, longitud: -101.0000 },
  { id: 'V268', nombre: 'SENDERO STA CATARINA',      region: 'Norte', estado: 'Nuevo León',         ciudad: 'Santa Catarina',   latitud: 25.6667, longitud: -100.4667 },
  { id: 'V269', nombre: 'LAS CHOAPAS',               region: 'Sur',   estado: 'Veracruz',           ciudad: 'Las Choapas',      latitud: 17.9167, longitud: -94.1000 },
  { id: 'V270', nombre: 'ALAMO',                     region: 'Sur',   estado: 'Veracruz',           ciudad: 'Álamo',            latitud: 20.9167, longitud: -97.6667 },
  { id: 'V271', nombre: 'ZITACURO',                  region: 'Sur',   estado: 'Michoacán',          ciudad: 'Zitácuaro',        latitud: 19.4333, longitud: -100.3500 },
  { id: 'V272', nombre: 'PLAZA LINDAVISTA 2',        region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4833, longitud: -99.1333 },
  { id: 'V273', nombre: 'CETRAM TOREO',              region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4500, longitud: -99.2000 },
  { id: 'V274', nombre: 'SENDERO APODACA',           region: 'Norte', estado: 'Nuevo León',         ciudad: 'Apodaca',          latitud: 25.7833, longitud: -100.1833 },
  { id: 'V275', nombre: 'TENANGO DEL VALLE',         region: 'Sur',   estado: 'Estado de México',   ciudad: 'Tenango del Valle',latitud: 19.1000, longitud: -99.5833 },
  { id: 'V276', nombre: 'PLAZA CITADEL MTY',         region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V277', nombre: 'PAPANTLA',                  region: 'Sur',   estado: 'Veracruz',           ciudad: 'Papantla',         latitud: 20.4500, longitud: -97.3167 },
  { id: 'V278', nombre: 'XOCHIMILCO 2',              region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.2570, longitud: -99.1027 },
  { id: 'V279', nombre: 'CD CUAHUTEMOC CHIHUAHUA',   region: 'Norte', estado: 'Chihuahua',          ciudad: 'Cuauhtémoc',       latitud: 28.4167, longitud: -106.8667 },
  { id: 'V280', nombre: 'NVO CASAS GRANDES CHIHUAHUA',region: 'Norte',estado: 'Chihuahua',          ciudad: 'Nuevo Casas Grandes',latitud: 30.4167, longitud: -107.9167 },
  { id: 'V281', nombre: 'PUERTA AJUSCO',             region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.2833, longitud: -99.1833 },
  { id: 'V282', nombre: 'FRANCISCO I MADERO',        region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4326, longitud: -99.1332 },
  { id: 'V283', nombre: 'PLAZA LIBRAMIENTO',         region: 'Norte', estado: 'Querétaro',          ciudad: 'Querétaro',        latitud: 20.5888, longitud: -100.3899 },
  { id: 'V284', nombre: 'HUATABAMPO',                region: 'Norte', estado: 'Sonora',             ciudad: 'Huatabampo',       latitud: 26.8167, longitud: -109.6333 },
  { id: 'V285', nombre: 'PASEO TUXTLA 2',            region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tuxtla Gutiérrez', latitud: 16.7521, longitud: -93.1167 },
  { id: 'V286', nombre: 'ZAPOPAN',                   region: 'Norte', estado: 'Jalisco',            ciudad: 'Zapopan',          latitud: 20.7167, longitud: -103.3833 },
  { id: 'V287', nombre: 'TOLUCA JUAREZ',             region: 'Sur',   estado: 'Estado de México',   ciudad: 'Toluca',           latitud: 19.2826, longitud: -99.6557 },
  { id: 'V288', nombre: 'PLAZA JARDIN NEZA',         region: 'Sur',   estado: 'Estado de México',   ciudad: 'Nezahualcóyotl',   latitud: 19.4000, longitud: -99.0167 },
  { id: 'V289', nombre: 'SENDERO PERIFERICO REYNOSA',region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Reynosa',          latitud: 26.0920, longitud: -98.2773 },
  { id: 'V290', nombre: 'PLAZA CACHANILLA MEXICALI', region: 'Norte', estado: 'Baja California',    ciudad: 'Mexicali',         latitud: 32.6245, longitud: -115.4523 },
  { id: 'V291', nombre: '20 DE NOVIEMBRE CDMX',      region: 'Sur',   estado: 'Ciudad de México',   ciudad: 'Ciudad de México', latitud: 19.4326, longitud: -99.1332 },
  { id: 'V292', nombre: 'PLAZA NVO MEXICALI',        region: 'Norte', estado: 'Baja California',    ciudad: 'Mexicali',         latitud: 32.6245, longitud: -115.4523 },
  { id: 'V293', nombre: 'PLAZA CRYSTAL PUEBLA',      region: 'Sur',   estado: 'Puebla',             ciudad: 'Puebla',           latitud: 19.0440, longitud: -98.1980 },
  { id: 'V294', nombre: 'GOMEZ PALACIO DGO',         region: 'Norte', estado: 'Durango',            ciudad: 'Gómez Palacio',    latitud: 25.5667, longitud: -103.4833 },
  { id: 'V295', nombre: 'AGUA PRIETA SONORA',        region: 'Norte', estado: 'Sonora',             ciudad: 'Agua Prieta',      latitud: 31.3333, longitud: -109.5500 },
  { id: 'V296', nombre: 'PLAZA ALAIA TAPACHULA',     region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tapachula',        latitud: 14.9000, longitud: -92.2667 },
  { id: 'V297', nombre: 'SENDERO CD JUAREZ LAS TORRES',region: 'Norte',estado: 'Chihuahua',         ciudad: 'Cd. Juárez',       latitud: 31.6904, longitud: -106.4245 },
  { id: 'V298', nombre: 'LA FE PLAZA COMERCIAL MTY', region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V299', nombre: 'PASEO JUAREZ',              region: 'Norte', estado: 'Chihuahua',          ciudad: 'Cd. Juárez',       latitud: 31.6904, longitud: -106.4245 },
  { id: 'V300', nombre: 'LA FE PLAZA COMERCIAL',     region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V301', nombre: 'PATIO LINCOLN',             region: 'Norte', estado: 'Nuevo León',         ciudad: 'Monterrey',        latitud: 25.6866, longitud: -100.3161 },
  { id: 'V302', nombre: 'PATIO ACAPULCO',            region: 'Sur',   estado: 'Guerrero',           ciudad: 'Acapulco',         latitud: 16.8531, longitud: -99.8238 },
  { id: 'V303', nombre: 'IRAPUATO CENTRO II',        region: 'Norte', estado: 'Guanajuato',         ciudad: 'Irapuato',         latitud: 20.6743, longitud: -101.3574 },
  { id: 'V304', nombre: 'SENDERO ESCOBEDO',          region: 'Norte', estado: 'Nuevo León',         ciudad: 'Gral. Escobedo',   latitud: 25.7833, longitud: -100.3167 },
  { id: 'V305', nombre: 'ACAYUCAN 2',                region: 'Sur',   estado: 'Veracruz',           ciudad: 'Acayucan',         latitud: 17.9500, longitud: -94.9167 },
  { id: 'V306', nombre: 'PASEO SENDERO ENSENADA',    region: 'Norte', estado: 'Baja California',    ciudad: 'Ensenada',         latitud: 31.8667, longitud: -116.5961 },
  { id: 'V307', nombre: 'AGUA DULCE CENTRO VER',     region: 'Sur',   estado: 'Veracruz',           ciudad: 'Agua Dulce',       latitud: 17.9000, longitud: -94.6500 },
  { id: 'V308', nombre: 'LEON CENTRO III',           region: 'Norte', estado: 'Guanajuato',         ciudad: 'León',             latitud: 21.1220, longitud: -101.6820 },
  { id: 'V309', nombre: 'TEPATITLAN JALISCO',        region: 'Norte', estado: 'Jalisco',            ciudad: 'Tepatitlán',       latitud: 20.8167, longitud: -102.7500 },
  { id: 'V310', nombre: 'PLAZA HUEHUETOCA',          region: 'Sur',   estado: 'Estado de México',   ciudad: 'Huehuetoca',       latitud: 19.8333, longitud: -99.2000 },
  { id: 'V311', nombre: 'CINTALAPA CENTRO CHIAPAS',  region: 'Sur',   estado: 'Chiapas',            ciudad: 'Cintalapa',        latitud: 16.6833, longitud: -93.7167 },
  { id: 'V312', nombre: 'GOMEZ PALACIO II CENTRO DGO',region: 'Norte',estado: 'Durango',            ciudad: 'Gómez Palacio',    latitud: 25.5667, longitud: -103.4833 },
  { id: 'V313', nombre: 'RIO BRAVO',                 region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Río Bravo',        latitud: 25.9833, longitud: -98.0833 },
  { id: 'V314', nombre: 'CARDEL',                    region: 'Sur',   estado: 'Veracruz',           ciudad: 'Cardel',           latitud: 19.3667, longitud: -96.3667 },
  { id: 'V315', nombre: 'CD JUAREZ CENTRO',          region: 'Norte', estado: 'Chihuahua',          ciudad: 'Cd. Juárez',       latitud: 31.6904, longitud: -106.4245 },
  { id: 'V316', nombre: 'VALLE HERMOSO',             region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Valle Hermoso',    latitud: 25.6667, longitud: -97.8167 },
  { id: 'V317', nombre: 'CHIHUAHUA',                 region: 'Norte', estado: 'Chihuahua',          ciudad: 'Chihuahua',        latitud: 28.6353, longitud: -106.0889 },
  { id: 'V318', nombre: 'LOS MOCHIS CENTRO',         region: 'Norte', estado: 'Sinaloa',            ciudad: 'Los Mochis',       latitud: 25.7906, longitud: -108.9870 },
  { id: 'V319', nombre: 'PLAYA VICENTE',             region: 'Sur',   estado: 'Veracruz',           ciudad: 'Playa Vicente',    latitud: 17.8333, longitud: -95.8167 },
  { id: 'V320', nombre: 'LOMA BONITA',               region: 'Sur',   estado: 'Oaxaca',             ciudad: 'Loma Bonita',      latitud: 18.1000, longitud: -95.8833 },
  { id: 'V321', nombre: 'JALPA DE MENDEZ TAB',       region: 'Sur',   estado: 'Tabasco',            ciudad: 'Jalpa de Méndez',  latitud: 18.1833, longitud: -93.0667 },
  { id: 'V322', nombre: 'PEROTE',                    region: 'Sur',   estado: 'Veracruz',           ciudad: 'Perote',           latitud: 19.5667, longitud: -97.2333 },
  { id: 'V323', nombre: 'CHILAPA DE ALVAREZ',        region: 'Sur',   estado: 'Guerrero',           ciudad: 'Chilapa',          latitud: 17.5833, longitud: -99.1667 },
  { id: 'V324', nombre: 'PLAZA DEL RIO REYNOSA',     region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Reynosa',          latitud: 26.0920, longitud: -98.2773 },
  { id: 'V325', nombre: 'SAN JUAN DE RIO',           region: 'Norte', estado: 'Querétaro',          ciudad: 'San Juan del Río', latitud: 20.3892, longitud: -100.0000 },
  { id: 'V326', nombre: 'PENJAMO',                   region: 'Norte', estado: 'Guanajuato',         ciudad: 'Pénjamo',          latitud: 20.4167, longitud: -101.7167 },
  { id: 'V327', nombre: 'DURANGO PASEO',             region: 'Norte', estado: 'Durango',            ciudad: 'Durango',          latitud: 24.0226, longitud: -104.6578 },
  { id: 'V328', nombre: 'COLIMA 2',                  region: 'Norte', estado: 'Colima',             ciudad: 'Colima',           latitud: 19.2433, longitud: -103.7241 },
  { id: 'V900', nombre: 'CHIHUAHUA',                 region: 'Norte', estado: 'Chihuahua',          ciudad: 'Chihuahua',        latitud: 28.6353, longitud: -106.0889 },
  { id: 'V901', nombre: 'TAPACHULA',                 region: 'Sur',   estado: 'Chiapas',            ciudad: 'Tapachula',        latitud: 14.9000, longitud: -92.2667 },
  { id: 'V902', nombre: 'CD VICTORIA',               region: 'Norte', estado: 'Tamaulipas',         ciudad: 'Cd. Victoria',     latitud: 23.7369, longitud: -99.1411 },
];

// ── HELPERS ──────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

// ── MAIN ─────────────────────────────────────────────────────────────
async function main() {
  await sequelize.authenticate();
  console.log('✅ Conectado a MySQL');

  const sqlLines: string[] = [];

  // ── 1. DIM_TIEMPO ────────────────────────────────────────────────
  console.log('⏳ Generando Dim_Tiempo...');
  const tiempoIds: number[] = [];

  for (const anio of [2024, 2025]) {
    const start = new Date(anio, 0, 1);
    const end   = new Date(anio, 11, 31);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const fecha     = d.toISOString().split('T')[0];
      const mes       = d.getMonth() + 1;
      const dia       = d.getDate();
      const diaSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][d.getDay()];
      const semana    = Math.ceil((d.getTime() - new Date(anio, 0, 1).getTime()) / 604800000) + 1;
      const trimestre = Math.ceil(mes / 3);
      const tempCom   = temporadaComercial(mes, dia);
      const festivo   = esFestivo(mes, dia) ? 1 : 0;
      const meses     = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
      const mesNombre = meses[mes - 1];
      const id_tiempo = parseInt(`${anio}${String(mes).padStart(2,'0')}${String(dia).padStart(2,'0')}`);

      tiempoIds.push(id_tiempo);
      sqlLines.push(
        `INSERT INTO Dim_Tiempo (id_tiempo,fecha,anio,mes_nombre,semana,dia_semana,numero_dia,trimestre,temporada,es_festivo) VALUES (${id_tiempo},'${fecha}',${anio},'${mesNombre}',${semana},'${diaSemana}',${dia},${trimestre},'${tempCom}',${festivo});`
      );
    }
  }
  console.log(`✅ Dim_Tiempo: ${tiempoIds.length} registros`);

  // ── 2. DIM_TIENDA ────────────────────────────────────────────────
  console.log('⏳ Generando Dim_Tienda...');
  for (const t of TIENDAS) {
    sqlLines.push(
      `INSERT INTO Dim_Tienda (id_tienda,nombre,region,estado,latitud,longitud,ciudad) VALUES ('${t.id}','${t.nombre.replace(/'/g,"\\'")}','${t.region}','${t.estado}',${t.latitud},${t.longitud},'${t.ciudad.replace(/'/g,"\\'")}');`
    );
  }
  console.log(`✅ Dim_Tienda: ${TIENDAS.length} registros`);

  // ── 3. DIM_PRODUCTO ──────────────────────────────────────────────
  console.log('⏳ Generando Dim_Producto...');
  const productos: { id: number; categoria: string; temporada: string; precio_lista: number }[] = [];
  let id_producto = 1;
  let modelo_id_counter = 10000;

  for (const cat of CATEGORIAS) {
    const tallas   = TALLAS_POR_CATEGORIA[cat];
    const modelos  = MODELOS_POR_CATEGORIA[cat];
    const [pMin, pMax] = PRECIO_BASE[cat];

    for (const modelo of modelos) {
      modelo_id_counter++;
      for (const talla of tallas) {
        for (const temp of TEMPORADAS_PRODUCTO) {
          const color    = pick(COLORES);
          const fit      = pick(FITS);
          const mat      = pick(MATERIALES);
          const precio   = randFloat(pMin, pMax);
          const composicion = `${mat.porcentaje}% ${mat.material}${mat.porcentaje < 100 ? `, ${100 - mat.porcentaje}% Elastano` : ''}`;

          sqlLines.push(
            `INSERT INTO Dim_Producto (modelo_id,descripcion,material_principal,porcentaje_principal,composicion_completa,talla,color,temporada,categoria,fit,precio_lista) VALUES (${modelo_id_counter},'${modelo} ${color}','${mat.material}',${mat.porcentaje},'${composicion}','${talla}','${color}','${temp}','${cat}','${fit}',${precio});`
          );

          productos.push({ id: id_producto, categoria: cat, temporada: temp, precio_lista: precio });
          id_producto++;
        }
      }
    }
  }
  console.log(`✅ Dim_Producto: ${productos.length} registros`);

  // ── 4. FACT_VENTAS + FACT_INVENTARIO_TIENDA ──────────────────────
  console.log('⏳ Generando Fact_Ventas y Fact_Inventario_Tienda...');

  const TOTAL_VENTAS_POR_ANIO = 100000;
  const ventasPorTiendaPorAnio = Math.ceil(TOTAL_VENTAS_POR_ANIO / TIENDAS.length);

  // Separar ids de tiempo por año
  const tiempoIdsPor: Record<number, number[]> = { 2024: [], 2025: [] };
  for (const id of tiempoIds) {
    const anio = Math.floor(id / 10000);
    tiempoIdsPor[anio].push(id);
  }

  let id_venta     = 1;
  let id_inventario = 1;
  let notaCounter  = 1;

  // Mapa inventario: key = `${id_producto}-${id_tienda}-${id_tiempo_mes}`
  const inventarioMap: Map<string, { recibida: number; vendida: number; id_tiempo: number }> = new Map();

  // Construir índice de tiendas por id para acceso rápido al estado
  const tiendaMap = new Map<string, typeof TIENDAS[0]>();
  for (const t of TIENDAS) tiendaMap.set(t.id, t);

  for (const anio of [2024, 2025]) {
    const tiemposAnio = tiempoIdsPor[anio];

    for (const tienda of TIENDAS) {
      let ventasGeneradas = 0;

      while (ventasGeneradas < ventasPorTiendaPorAnio) {
        // Elegir fecha aleatoria del año
        const id_tiempo = pick(tiemposAnio);
        const mes       = Math.floor((id_tiempo % 10000) / 100);
        const dia       = id_tiempo % 100;

        // Elegir producto compatible con la temporada del mes
        const tempEsperada = TEMPORADA_MES[mes];
        const productosFiltrados = productos.filter(p =>
          Math.random() < 0.6 ? p.temporada === tempEsperada : true
        );
        const prod = pick(productosFiltrados);

        // ── Calcular el factor de ventas combinado para este contexto ──
        const factorTotal = factorVentasTotal(mes, dia, prod.categoria, tienda.estado);

        // Usar el factor como probabilidad de aceptar esta venta.
        // Normalizamos sobre un valor base de ~1.3 (factor típico sin ajustes).
        // Si el factor es bajo (ropa de calor en invierno → 0.20), la mayoría
        // de intentos se rechazan y se reintenta con otro producto/fecha.
        const probabilidadAceptar = Math.min(factorTotal / 4.5, 1.0);
        if (Math.random() > probabilidadAceptar) continue;

        // Verificar/crear inventario
        const mesKey    = `${anio}${String(mes).padStart(2,'0')}`;
        const invKey    = `${prod.id}-${tienda.id}-${mesKey}`;
        const id_tiempo_mes = parseInt(`${anio}${String(mes).padStart(2,'0')}01`);

        if (!inventarioMap.has(invKey)) {
          inventarioMap.set(invKey, {
            recibida: randInt(200, 800),
            vendida:  0,
            id_tiempo: id_tiempo_mes,
          });
        }

        const inv = inventarioMap.get(invKey)!;
        const stockDisponible = inv.recibida - inv.vendida;
        if (stockDisponible <= 0) continue;

        // Cantidad base + boost de festivo en la cantidad
        const esFest = esFestivo(mes, dia);
        // En festivos se vende 1.5x–2x más (se refleja en mayor cantidad por ticket)
        const cantidadBase = randInt(1, 3);
        const cantidadFinal = esFest
          ? Math.min(Math.round(cantidadBase * (1.5 + Math.random() * 0.5)), stockDisponible)
          : Math.min(cantidadBase, stockDisponible);
        if (cantidadFinal <= 0) continue;

        // ── Precio: en festivos el ticket es ~50% más alto ──────────────
        // Se implementa reduciendo el porcentaje de descuento en festivos
        // (la gente paga más cerca/durante el festivo) y aplicando un
        // multiplicador al precio_final para reflejar el ticket elevado.
        const esDescuento = Math.random() < 0.35 || mes === 1 || (mes === 11 && dia >= 15 && dia <= 20);
        const descPct     = esDescuento ? randFloat(0.10, 0.50) : 0;
        const precio_original = prod.precio_lista;

        // En días festivos: precio final con el multiplicador 1.5
        // pero sin superar precio_original (no subimos sobre precio lista).
        // La interpretación es: en festivos se vende menos en descuento
        // y el precio efectivo es más cercano al precio lista.
        let precio_final: number;
        if (esFest) {
          // Ticket festivo: reducir descuento a la mitad y aplicar x1.5 al precio neto
          const descPctFestivo = descPct * 0.33; // descuento mucho menor en festivos
          const precioBase = parseFloat((precio_original * (1 - descPctFestivo)).toFixed(2));
          // El ticket más alto se logra por la cantidad (ya aplicada arriba)
          // y por un ligero sobreprecio de temporada (máx precio lista)
          precio_final = Math.min(
            parseFloat((precioBase * 1.15).toFixed(2)),
            precio_original
          );
        } else {
          precio_final = parseFloat((precio_original * (1 - descPct)).toFixed(2));
        }

        const id_nota = `${tienda.id}-${anio}${String(notaCounter).padStart(7,'0')}`;

        sqlLines.push(
          `INSERT INTO Fact_Ventas (id_nota,id_producto,id_tienda,id_tiempo,precio_final,precio_original,cantidad,es_descuento) VALUES ('${id_nota}',${prod.id},'${tienda.id}',${id_tiempo},${precio_final},${precio_original},${cantidadFinal},${esDescuento ? 1 : 0});`
        );

        inv.vendida += cantidadFinal;
        id_venta++;
        notaCounter++;
        ventasGeneradas++;
      }
    }
  }

  // Generar inserts de inventario
  for (const [key, inv] of inventarioMap) {
    const parts   = key.split('-');
    const prod_id = parts[0];
    const tnd_id  = parts[1];
    sqlLines.push(
      `INSERT INTO Fact_Inventario_Tienda (cantidad_recibida,id_producto,id_tiempo,id_tienda,cantidad_vendida) VALUES (${inv.recibida},${prod_id},${inv.id_tiempo},'${tnd_id}',${inv.vendida});`
    );
    id_inventario++;
  }

  console.log(`✅ Fact_Ventas: ~${id_venta - 1} registros`);
  console.log(`✅ Fact_Inventario_Tienda: ${id_inventario - 1} registros`);

  // ── 5. ESCRIBIR ARCHIVO SQL ──────────────────────────────────────
  console.log('💾 Escribiendo archivo SQL...');
  const sqlContent = [
    'SET FOREIGN_KEY_CHECKS=0;',
    'TRUNCATE TABLE Fact_Ventas;',
    'TRUNCATE TABLE Fact_Inventario_Tienda;',
    'TRUNCATE TABLE Dim_Producto;',
    'TRUNCATE TABLE Dim_Tiempo;',
    'TRUNCATE TABLE Dim_Tienda;',
    'SET FOREIGN_KEY_CHECKS=1;',
    ...sqlLines,
  ].join('\n');

  fs.writeFileSync('src/scripts/seed.sql', sqlContent, 'utf8');
  console.log('✅ Archivo scripts/seed.sql generado');
  console.log(`📊 Total inserts: ${sqlLines.length}`);

  await sequelize.close();
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});