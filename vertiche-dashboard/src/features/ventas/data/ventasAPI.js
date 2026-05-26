const BASE_TENDENCIAS = 'http://localhost:8080/tendencias';
const BASE_PRODUCTOS  = 'http://localhost:8080/analisis/productos';
const BASE_TIENDAS    = 'http://localhost:8080/analisis/tiendas';

// ── Helper ───────────────────────────────────────────────────────────
async function get(baseUrl, endpoint, params = {}) {
  const url = new URL(`${baseUrl}/${endpoint}`);
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    .forEach(([k, v]) => url.searchParams.append(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error ${res.status} en ${endpoint}`);
  return res.json();
}

// ── Tendencias ───────────────────────────────────────────────────────

// GET /tendencias/performance
export async function fetchPerformance(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get(BASE_TENDENCIAS, 'performance', { period, zona, temporada });
}

// GET /tendencias/yoy
export async function fetchYoY(filters = {}) {
  const { zona, temporada } = filters;
  return get(BASE_TENDENCIAS, 'yoy', { zona, temporada });
}

// GET /tendencias/trimestral
export async function fetchTrimestral(filters = {}) {
  const { zona } = filters;
  return get(BASE_TENDENCIAS, 'trimestral', { zona });
}

// GET /tendencias/festivos
export async function fetchFestivos(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get(BASE_TENDENCIAS, 'festivos', { period, zona, temporada });
}

// ── Análisis de Productos ────────────────────────────────────────────

// GET /analisis/productos/tallas
export async function fetchTallas(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get(BASE_PRODUCTOS, 'tallas', { period, zona, temporada });
}

// GET /analisis/productos/temporadas-categoria
export async function fetchTemporadasCategoria(filters = {}) {
  const { zona } = filters;
  return get(BASE_PRODUCTOS, 'temporadas-categoria', { zona });
}

// GET /analisis/productos/top-productos
export async function fetchTopProductos(filters = {}, limit = 10) {
  const { period = '30d', zona, temporada } = filters;
  return get(BASE_PRODUCTOS, 'top-productos', { period, limit, zona, temporada });
}

// ── Análisis de Tiendas ──────────────────────────────────────────────

// GET /analisis/tiendas/ticket-zona
export async function fetchTicketZona(filters = {}) {
  const { period = '30d', temporada } = filters;
  return get(BASE_TIENDAS, 'ticket-zona', { period, temporada });
}

// GET /analisis/tiendas/ranking-tiendas
export async function fetchRankingTiendas(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get(BASE_TIENDAS, 'ranking-tiendas', { period, zona, temporada });
}

// GET /analisis/tiendas/ventas-estado
export async function fetchVentasEstado(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get(BASE_TIENDAS, 'ventas-estado', { period, zona, temporada });
}

// ── Sin filtros analíticos ───────────────────────────────────────────
export async function fetchTiendas() {
  const url = new URL('http://localhost:8080/tiendas');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error ${res.status} en tiendas`);
  return res.json();
}