const BASE_URL = 'http://localhost:8080/ventas';

// ── Helper ───────────────────────────────────────────────────────────
async function get(endpoint, params = {}) {
  const url = new URL(`${BASE_URL}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Error ${res.status} en ${endpoint}`);
  return res.json();
}

// ── Performance general (KPIs + serie) ──────────────────────────────
// GET /ventas/performance?period=30d
export async function fetchPerformance(period = '30d', region = 'all') {
  console.log("fetchPerformance(): ", period, region)
  return get('performance', { period, region });
}

// ── Comparativo año contra año ───────────────────────────────────────
// GET /ventas/yoy
export async function fetchYoY(period = '30d', region = 'all') {
  return get('yoy', { period, region });
}

// ── Top productos ────────────────────────────────────────────────────
// GET /ventas/top-productos?limit=10
export async function fetchTopProductos(limit = 10, period = '30d', region = 'all') {
  return get('top-productos', { limit, period, region });
}

// ── Ranking tiendas ──────────────────────────────────────────────────
// GET /ventas/tiendas
export async function fetchTiendas(period = '30d', region = 'all') {
  return get('tiendas', { period, region });
}

// ── Alertas de stock ─────────────────────────────────────────────────
// GET /ventas/stock-alerts
export async function fetchStockAlerts(period = '30d', region = 'all') {
  return get('stock-alerts', { period, region });
}

// ── Scatter descuentos ───────────────────────────────────────────────
// GET /ventas/descuentos
export async function fetchDescuentos(period = '30d', region = 'all') {
  return get('descuentos', { period, region });
}

// ── Ticket promedio por zona ─────────────────────────────────────────
// GET /ventas/ticket-zona
export async function fetchTicketZona(period = '30d', region = 'all') {
  return get('ticket-zona', { period, region });
}

// ── Ventas por temporada ─────────────────────────────────────────────
// GET /ventas/temporadas
export async function fetchTemporadas(period = '30d', region = 'all') {
  return get('temporadas', { period, region });
}

// ── Distribución por talla ───────────────────────────────────────────
// GET /ventas/tallas
export async function fetchTallas(period = '30d', region = 'all') {
  return get('tallas', { period, region });
}

// ── Rotación de inventario ───────────────────────────────────────────
// GET /ventas/rotacion
export async function fetchRotacion(period = '30d', region = 'all') {
  return get('rotacion', { period, region });
}

// ── Recibido vs vendido ──────────────────────────────────────────────
// GET /ventas/recibido-vendido
export async function fetchRecibidoVendido(period = '30d', region = 'all') {
  return get('recibido-vendido', { period, region });
}

// ── KPIs de cobertura ────────────────────────────────────────────────
// GET /ventas/cobertura
export async function fetchCobertura(period = '30d', region = 'all') {
  return get('cobertura', { period, region });
}

export async function fetchTrimestral(period = '30d', region = 'all') {
  return get('trimestral', { period, region });
}

export async function fetchFestivos(period = '30d', region = 'all') {
  return get('festivos', { period, region });
}

// Apis de Productos
export async function fetchTemporadasCategoria(period = '30d', region = 'all') {
  return get('temporadas-categoria', { period, region });
}

// Tiendas
export async function fetchRankingTiendas(period = '30d', region = 'all') {
  return get('ranking-tiendas', { period, region });
}
