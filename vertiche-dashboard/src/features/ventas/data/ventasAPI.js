const BASE_URL = 'http://localhost:8080/ventas';

// ── Helper ───────────────────────────────────────────────────────────
async function get(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    .forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error ${res.status} en ${endpoint}`);
  return res.json();
}

// ── Performance general (KPIs + serie) — los 3 filtros ──────────────
export async function fetchPerformance(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('performance', { period, zona, temporada });
}

// ── Comparativo año contra año — zona y temporada ────────────────────
export async function fetchYoY(filters = {}) {
  const { zona, temporada } = filters;
  return get('yoy', { zona, temporada });
}

// ── Ventas por trimestre — solo zona ────────────────────────────────
export async function fetchTrimestral(filters = {}) {
  const { zona } = filters;
  return get('trimestral', { zona });
}

// ── Festivos vs normales — los 3 filtros ────────────────────────────
export async function fetchFestivos(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('festivos', { period, zona, temporada });
}

// ── Distribución por talla — los 3 filtros ──────────────────────────
export async function fetchTallas(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('tallas', { period, zona, temporada });
}

// ── Temporadas × categoría — los 3 filtros ──────────────────────────
export async function fetchTemporadasCategoria(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('temporadas-categoria', { period, zona, temporada });
}

// ── Top productos — los 3 filtros ────────────────────────────────────
export async function fetchTopProductos(filters = {}, limit = 10) {
  const { period = '30d', zona, temporada } = filters;
  return get('top-productos', { period, limit, zona, temporada });
}

// ── Ticket promedio por zona — los 3 filtros ─────────────────────────
export async function fetchTicketZona(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('ticket-zona', { period, zona, temporada });
}

// ── Ranking tiendas — los 3 filtros ──────────────────────────────────
export async function fetchRankingTiendas(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('ranking-tiendas', { period, zona, temporada });
}

// ── Sin filtros analíticos ───────────────────────────────────────────
export async function fetchTiendas() {
  return get('tiendas');
}

// ── Ventas por estado — mapa de calor — los 3 filtros ───────────────
export async function fetchVentasEstado(filters = {}) {
  const { period = '30d', zona, temporada } = filters;
  return get('ventas-estado', { period, zona, temporada });
}
