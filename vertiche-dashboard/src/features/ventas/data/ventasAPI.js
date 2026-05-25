const BASE_URL = 'http://localhost:8080/ventas';

/**
 * Helper interno de fetch para el API de ventas.
 * Omite parámetros con valor undefined, null, '' o 'all' — el backend
 * interpreta la ausencia de un parámetro como "sin filtro aplicado".
 * Lanza Error si el status HTTP no es 2xx.
 *
 * @param {string} endpoint - Nombre del recurso, e.g. 'performance', 'yoy'
 * @param {Object} [params={}] - Parámetros de query. Valores null/undefined/''/'all' se omiten.
 * @returns {Promise<any>} JSON parseado de la respuesta
 * @throws {Error} Si res.ok === false
 */
async function get(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    .forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error ${res.status} en ${endpoint}`);
  return res.json();
}

/**
 * Obtiene los KPIs generales y la serie temporal del periodo activo.
 * Es el único endpoint que devuelve el array `kpis` para SectionPerformance.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<{
 *   kpis: Array<{ label: string, value: string, sub?: string, delta: string, pos: boolean, cl: string }>,
 *   labels: string[],
 *   revenue: number[],
 *   units: number[],
 *   period: string
 * }>}
 */
export async function fetchPerformance(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('performance', { period, zona, temporada });
}

/**
 * Obtiene la comparación interanual de ingresos mensuales (12 meses, ene–dic).
 * No acepta `period` — el eje temporal es siempre el año completo.
 *
 * @param {{ zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<{ actual: number[], anterior: number[] }>}
 *   Dos arrays de 12 valores ($K) para el año en curso y el anterior.
 */
export async function fetchYoY(filters = {}) {
  const { zona, temporada } = filters;
  return get('yoy', { zona, temporada });
}

/**
 * Obtiene ingresos agrupados por temporada de producto (Primavera/Verano/Otoño/Invierno).
 * Solo acepta `zona` — el agrupamiento es por temporada, no por ventana de tiempo.
 *
 * @param {{ zona?: string }} [filters={}]
 * @returns {Promise<Array<{ season: string, value: number }>>}
 */
export async function fetchTrimestral(filters = {}) {
  const { zona } = filters;
  return get('trimestral', { zona });
}

/**
 * Obtiene comparación de métricas entre días festivos y días normales.
 * Devuelve exactamente 4 tarjetas KPI: ingreso festivo, ingreso normal, ratio, ticket festivo.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<Array<{ label: string, val: string, color: string, sub: string }>>}
 */
export async function fetchFestivos(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('festivos', { period, zona, temporada });
}

/**
 * Obtiene la distribución de unidades vendidas por talla.
 * El array incluye tallas letra (XCH/CH/M/G/XG/Unitalla) y tallas número (34–42)
 * mezcladas — UnidadesTallaChart las separa según el toggle del usuario.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<Array<{ name: string, value: number }>>}
 */
export async function fetchTallas(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('tallas', { period, zona, temporada });
}

/**
 * Obtiene ventas desagregadas por temporada × categoría de producto,
 * en el formato listo para BarChart apilado de Recharts.
 * Solo acepta `zona` — la dimensión temporal es la temporada de producto, no el periodo.
 *
 * @param {{ zona?: string }} [filters={}]
 * @returns {Promise<{
 *   stackedData: Array<{ season: string, [cat: string]: number }>,
 *   cats: string[],
 *   colors: string[]
 * }>}
 */
export async function fetchTemporadasCategoria(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('temporadas-categoria', { period, zona, temporada });
}

/**
 * Obtiene los productos de mayor ingreso dentro del periodo y filtros dados.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @param {number} [limit=10] - Cuántos productos devolver
 * @returns {Promise<Array<{ name: string, rev: number, units: number, dcto: number }>>}
 *   rev en $K, dcto en porcentaje de descuento promedio aplicado.
 */
export async function fetchTopProductos(filters = {}, limit = 10) {
  const { period = '30d', zona, temporada } = filters;
  return get('top-productos', { period, limit, zona, temporada });
}

/**
 * Obtiene el ticket promedio mensual desglosado por Zona Norte y Zona Sur.
 *
 * NOTA: SectionTiendas llama este fetch sin el filtro `zona` intencionalmente
 * (ver comentario en SectionTiendas.jsx). El endpoint acepta `zona` pero
 * usarlo eliminaría una de las dos columnas, rompiendo la comparación Norte/Sur.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<{ labels: string[], norte: number[], sur: number[] }>}
 */
export async function fetchTicketZona(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('ticket-zona', { period, zona, temporada });
}

/**
 * Obtiene métricas por tienda ordenadas por ingreso descendente.
 * Usado tanto por DistribucionZonaTable como por RankingTiendasTable —
 * ambos reciben el mismo array y lo presentan con columnas distintas.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<Array<{
 *   id: string,
 *   nombre: string,
 *   zona: 'Norte' | 'Sur',
 *   ingresos: number,
 *   ticket: number,
 *   uds: number,
 *   delta: string,
 *   deltaPos: boolean
 * }>>}
 */
export async function fetchRankingTiendas(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('ranking-tiendas', { period, zona, temporada });
}

/**
 * Obtiene el catálogo de tiendas sin filtros analíticos.
 * Se usa cuando se necesita la lista de tiendas independientemente del periodo o temporada.
 *
 * @returns {Promise<Array<{ id: string, nombre: string, zona: 'Norte' | 'Sur', estado: string }>>}
 */
export async function fetchTiendas() {
  return get('tiendas');
}

/**
 * Obtiene métricas de ventas agrupadas por estado para el mapa de calor D3.
 * Los estados sin tiendas activas (o sin datos en el filtro dado) no aparecen
 * en el array — MapaCalorMexico los colorea en gris al no encontrarlos en el índice.
 *
 * El campo `estado` debe coincidir exactamente con la propiedad `nom_edo`
 * del archivo mexicoGeo.json para que la unión D3 funcione correctamente.
 *
 * @param {{ period?: string, zona?: string, temporada?: string }} [filters={}]
 * @returns {Promise<Array<{
 *   estado: string,
 *   region: 'Norte' | 'Sur',
 *   ingresos: number,
 *   ticket: number,
 *   unidades: number
 * }>>}
 */
export async function fetchVentasEstado(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('ventas-estado', { period, zona, temporada });
}
