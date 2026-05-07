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
export async function fetchPerformance(period = '30d') {
  return get('performance', { period });
}

// ── Comparativo año contra año ───────────────────────────────────────
// GET /ventas/yoy
export async function fetchYoY(period = '30d') {
  return get('yoy', { period });
}

// ── Top productos ────────────────────────────────────────────────────
// GET /ventas/top-productos?limit=10
export async function fetchTopProductos(limit = 10, period = '30d') {
  return get('top-productos', { limit, period });
}

// ── Ranking tiendas ──────────────────────────────────────────────────
// GET /ventas/tiendas
export async function fetchTiendas(period = '30d') {
  return get('tiendas', { period });
}

// ── Alertas de stock ─────────────────────────────────────────────────
// GET /ventas/stock-alerts
export async function fetchStockAlerts(period = '30d') {
  return get('stock-alerts', { period });
}

// ── Scatter descuentos ───────────────────────────────────────────────
// GET /ventas/descuentos
export async function fetchDescuentos(period = '30d') {
  return get('descuentos', { period });
}

// ── Ticket promedio por zona ─────────────────────────────────────────
// GET /ventas/ticket-zona
export async function fetchTicketZona(period = '30d') {
  return get('ticket-zona', { period });
}

// ── Ventas por temporada ─────────────────────────────────────────────
// GET /ventas/temporadas
export async function fetchTemporadas(period = '30d') {
  return get('temporadas', { period });
}

// ── Distribución por talla ───────────────────────────────────────────
// GET /ventas/tallas
export async function fetchTallas(period = '30d') {
  return get('tallas', { period });
}

// ── Rotación de inventario ───────────────────────────────────────────
// GET /ventas/rotacion
export async function fetchRotacion(period = '30d') {
  return get('rotacion', { period });
}

// ── Recibido vs vendido ──────────────────────────────────────────────
// GET /ventas/recibido-vendido
export async function fetchRecibidoVendido(period = '30d') {
  return get('recibido-vendido', { period });
}

// ── KPIs de cobertura ────────────────────────────────────────────────
// GET /ventas/cobertura
export async function fetchCobertura(period = '30d') {
  return get('cobertura', { period });
}

export async function fetchTrimestral(period = '30d') {
  console.log("fetchTrimestral()");
  console.log("fetchTrimestral() period: ", period);
  return get('trimestral', { period });
}

export async function fetchFestivos(period = '30d') {
  return get('festivos', { period });
}

// Apis de Productos
export async function fetchTemporadasCategoria(period = '30d') {
  return get('temporadas-categoria', { period });
}

// Tiendas
export async function fetchRankingTiendas(period = '30d') {
  return get('ranking-tiendas', { period });
}
