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
export async function fetchYoY() {
  return get('yoy');
}

// ── Top productos ────────────────────────────────────────────────────
// GET /ventas/top-productos?limit=10
export async function fetchTopProductos(limit = 10) {
  return get('top-productos', { limit });
}

// ── Ranking tiendas ──────────────────────────────────────────────────
// GET /ventas/tiendas
export async function fetchTiendas() {
  return get('tiendas');
}

// ── Alertas de stock ─────────────────────────────────────────────────
// GET /ventas/stock-alerts
export async function fetchStockAlerts() {
  return get('stock-alerts');
}

// ── Scatter descuentos ───────────────────────────────────────────────
// GET /ventas/descuentos
export async function fetchDescuentos() {
  return get('descuentos');
}

// ── Ticket promedio por zona ─────────────────────────────────────────
// GET /ventas/ticket-zona
export async function fetchTicketZona() {
  return get('ticket-zona');
}

// ── Ventas por temporada ─────────────────────────────────────────────
// GET /ventas/temporadas
export async function fetchTemporadas() {
  return get('temporadas');
}

// ── Distribución por talla ───────────────────────────────────────────
// GET /ventas/tallas
export async function fetchTallas() {
  return get('tallas');
}

// ── Rotación de inventario ───────────────────────────────────────────
// GET /ventas/rotacion
export async function fetchRotacion() {
  return get('rotacion');
}

// ── Recibido vs vendido ──────────────────────────────────────────────
// GET /ventas/recibido-vendido
export async function fetchRecibidoVendido() {
  return get('recibido-vendido');
}

// ── KPIs de cobertura ────────────────────────────────────────────────
// GET /ventas/cobertura
export async function fetchCobertura() {
  return get('cobertura');
}

export async function fetchTrimestral() {
  return get('trimestral');
}

export async function fetchFestivos() {
  return get('festivos');
}

// Apis de Productos
export async function fetchTemporadasCategoria() {
  return get('temporadas-categoria');
}

// Tiendas
export async function fetchRankingTiendas() {
  return get('ranking-tiendas');
}
