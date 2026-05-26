/**
 * Datos mock organizados por periodo para SectionPerformance y gráficas de línea.
 * En producción queda inactivo — el hook useVentasFetch siempre intenta el fetch real primero.
 * Se mantiene como fallback de desarrollo y para pruebas sin backend.
 *
 * @type {Object.<'7d'|'30d'|'90d'|'1y', {
 *   labels:  string[],
 *   revenue: number[],
 *   units:   number[],
 *   kpis:    Array<{ label: string, value: string, sub?: string, delta: string, pos: boolean, cl: string }>
 * }>}
 */
export const DATA = {
  '7d': {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    revenue: [42, 58, 51, 67, 74, 89, 62],
    units: [320, 415, 378, 502, 556, 634, 441],
    kpis: [
      { label: 'Ingresos Totales', value: '$443K', sub: '', delta: '+12.4%', pos: true, cl: 'c1' },
      { label: 'Ticket Promedio / Folio', value: '$1,240', sub: '', delta: '+3.1%', pos: true, cl: 'c2' },
      { label: 'Unidades Vendidas', value: '2,846', sub: '', delta: '+8.7%', pos: true, cl: 'c3' },
    ],
  },
  '30d': {
    labels: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9', 'S10', 'S11', 'S12', 'S13'],
    revenue: [88, 95, 102, 91, 118, 134, 110, 142, 156, 129, 168, 145, 177],
    units: [680, 720, 810, 750, 920, 1050, 870, 1100, 1230, 980, 1310, 1140, 1380],
    kpis: [
      { label: 'Ingresos Totales', value: '$1.66M', delta: '+18.2%', pos: true, cl: 'c1' },
      { label: 'Ticket Promedio / Folio', value: '$1,180', delta: '+2.4%', pos: true, cl: 'c2' },
      { label: 'Unidades Vendidas', value: '14,280', delta: '+11.3%', pos: true, cl: 'c3' },
      { label: 'Unidades redistribuidas', value: '1,349', delta: '-1.34%', pos: true, cl: 'c4' },
      { label: 'SKUs Stock Crítico', value: '12', delta: '↑5 vs mes ant.', pos: false, cl: 'c5' },
    ],
    insight: { type: 'ok', title: 'Crecimiento sólido en Zona Norte', text: 'Las tiendas de Zona Norte acumulan 68% del ingreso total del período.' },
  },
  '90d': {
    labels: ['Ene', 'Feb', 'Mar'],
    revenue: [420, 510, 640],
    units: [3200, 3900, 4800],
    kpis: [
      { label: 'Ingresos Totales', value: '$4.92M', sub: 'SUM precio_final', delta: '+22.1%', pos: true, cl: 'c1' },
      { label: 'Ticket Promedio / Folio', value: '$1,095', sub: 'AVERAGEX por id_nota', delta: '+5.2%', pos: true, cl: 'c2' },
      { label: 'Unidades Vendidas', value: '43,540', sub: 'COUNT id_venta', delta: '+15.8%', pos: true, cl: 'c3' },
    ],
    insight: { type: 'ok', title: 'Q1 con mejor desempeño en 2 años', text: 'Marzo concentra 46% del ingreso trimestral, impulsado por inicio de Temporada Primavera.' },
  },
  '1y': {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    revenue: [210, 245, 310, 290, 380, 420, 390, 450, 510, 480, 560, 640],
    units: [1800, 2100, 2600, 2400, 3100, 3400, 3100, 3700, 4100, 3800, 4500, 5100],
    kpis: [
      { label: 'Ingresos Totales', value: '$18.3M', sub: 'SUM precio_final', delta: '+31.4%', pos: true, cl: 'c1' },
      { label: 'Ticket Promedio / Folio', value: '$1,015', sub: 'AVERAGEX por id_nota', delta: '+8.9%', pos: true, cl: 'c2' },
      { label: 'Unidades Vendidas', value: '164K', sub: 'COUNT id_venta', delta: '+24.7%', pos: true, cl: 'c3' },
      { label: 'Mejor Temporada', value: 'Nov–Dic', sub: 'Buen Fin + Navidad', delta: '38% del ingreso anual', pos: true, cl: 'c5' },
    ],
    insight: { type: 'warn', title: 'Nov–Dic concentran 38% del ingreso anual', text: 'Buen Fin y Navidad son los eventos críticos. Pre-posicionar inventario con mínimo 3 semanas de anticipación.' },
  },
};

/**
 * Serie de ingresos mensuales del año anterior para IngresosMensualesChart (mock YoY).
 * 12 valores en $K, alineados con los meses Ene–Dic.
 * @type {number[]}
 */
export const yoy23 = [180, 210, 270, 250, 320, 360, 340, 390, 440, 410, 490, 580];

/**
 * Serie de ingresos mensuales del año en curso para IngresosMensualesChart (mock YoY).
 * 12 valores en $K, alineados con los meses Ene–Dic.
 * @type {number[]}
 */
export const yoy24 = [210, 245, 310, 290, 380, 420, 390, 450, 510, 480, 560, 640];

/**
 * Mock de top 10 productos por ingreso para TopProductosChart y ParetoSKUChart.
 * SectionProductos reutiliza este mismo array para ambos charts: uno lo usa directo
 * y el otro lo pasa por buildParetoData para calcular el porcentaje acumulado.
 *
 * @type {Array<{ name: string, rev: number, units: number, dcto: number }>}
 *   rev en $K, dcto en porcentaje de descuento promedio aplicado.
 */
export const TOP_PRODS = [
  { name: 'Vestido midi sin mangas', rev: 142, units: 2340, dcto: 8 },
  { name: 'Jean recto con jareta', rev: 128, units: 1870, dcto: 12 },
  { name: 'Playera crop amarre frontal', rev: 115, units: 3120, dcto: 5 },
  { name: 'Sudadera tejido botones', rev: 98, units: 1250, dcto: 18 },
  { name: 'Blusa cuello alto', rev: 87, units: 1640, dcto: 7 },
  { name: 'Chamarra oversize', rev: 76, units: 820, dcto: 22 },
  { name: 'Conjunto top falda', rev: 68, units: 1100, dcto: 10 },
  { name: 'Vestido strapless', rev: 61, units: 890, dcto: 14 },
  { name: 'Pantalón ciclón ajustado', rev: 54, units: 1320, dcto: 9 },
  { name: 'Playera bordada perlas', rev: 48, units: 1560, dcto: 6 },
];

/**
 * Mock de tiendas activas para DistribucionZonaTable y RankingTiendasTable.
 * Ambas tablas reciben este mismo array — la diferencia está en las columnas que muestran.
 *
 * @type {Array<{
 *   id: string, nombre: string, zona: 'Norte'|'Sur',
 *   ingresos: number, ticket: number, uds: number,
 *   delta: string, deltaPos: boolean
 * }>}
 */
export const TIENDAS = [
  { id: 'V038', nombre: 'Toluca', zona: 'Norte', ingresos: 65, ticket: 1380, uds: 1240, delta: '+7K', deltaPos: true },
  { id: 'V012', nombre: 'CDMX Norte', zona: 'Norte', ingresos: 58, ticket: 1290, uds: 1105, delta: '+4K', deltaPos: true },
  { id: 'V031', nombre: 'Monterrey', zona: 'Norte', ingresos: 52, ticket: 1210, uds: 1020, delta: '+2K', deltaPos: true },
  { id: 'V068', nombre: 'Villahermosa', zona: 'Sur', ingresos: 44, ticket: 980, uds: 890, delta: '-3K', deltaPos: false },
  { id: 'V045', nombre: 'Guadalajara', zona: 'Sur', ingresos: 41, ticket: 1050, uds: 842, delta: '+1K', deltaPos: true },
  { id: 'V057', nombre: 'Puebla', zona: 'Norte', ingresos: 38, ticket: 1180, uds: 780, delta: '=', deltaPos: true },
  { id: 'V019', nombre: 'Querétaro', zona: 'Norte', ingresos: 35, ticket: 1120, uds: 720, delta: '+3K', deltaPos: true },
];

/**
 * Mock de alertas de stock crítico por SKU y tienda.
 * NOTA: No está conectado a ningún componente activo en la build actual.
 * Si se elimina la funcionalidad de alertas de stock, este export puede borrarse.
 *
 * @type {Array<{ modelo: string, talla: string, zona: string, tienda: string, stock: number, dias: number, nivel: 'err'|'warn' }>}
 */
export const STOCK_ALERTS = [
  { modelo: 'Vestido midi sin mangas', talla: 'M', zona: 'Norte', tienda: 'V038 Toluca', stock: 45, dias: 4, nivel: 'err' },
  { modelo: 'Jean recto con jareta', talla: 'G', zona: 'Sur', tienda: 'V068 Villahermosa', stock: 28, dias: 5, nivel: 'err' },
  { modelo: 'Playera crop amarre', talla: 'CH', zona: 'Norte', tienda: 'V012 CDMX Norte', stock: 62, dias: 6, nivel: 'err' },
  { modelo: 'Sudadera tejido botones', talla: 'XG', zona: 'Norte', tienda: 'V031 Monterrey', stock: 15, dias: 7, nivel: 'err' },
  { modelo: 'Blusa cuello alto', talla: 'M', zona: 'Sur', tienda: 'V045 Guadalajara', stock: 84, dias: 12, nivel: 'warn' },
  { modelo: 'Chamarra oversize', talla: 'G', zona: 'Norte', tienda: 'V057 Puebla', stock: 105, dias: 18, nivel: 'warn' },
  { modelo: 'Conjunto top falda', talla: 'CH', zona: 'Norte', tienda: 'V038 Toluca', stock: 130, dias: 22, nivel: 'warn' },
];

/**
 * Mock de correlación descuento vs unidades por categoría (para scatterplot).
 * NOTA: No está conectado a ningún componente activo en la build actual.
 * Si se elimina el análisis de descuento, este export puede borrarse.
 *
 * @type {Array<{ cat: string, dcto: number, uds: number }>}
 */
export const SCATTER_DCTO = [
  { cat: 'Playera', dcto: 6, uds: 4680 },
  { cat: 'Pantalón', dcto: 9, uds: 3190 },
  { cat: 'Vestido', dcto: 11, uds: 3230 },
  { cat: 'Sudadera', dcto: 18, uds: 1250 },
  { cat: 'Chamarra', dcto: 22, uds: 820 },
  { cat: 'Blusa', dcto: 7, uds: 2640 },
  { cat: 'Conjunto', dcto: 10, uds: 1100 },
];

/**
 * Mock de ticket promedio mensual por zona para TicketPromedioZonaChart.
 * SectionTiendas transforma este objeto al formato `[{ mes, Norte, Sur }]`
 * que espera Recharts antes de pasarlo al chart.
 *
 * @type {{ labels: string[], norte: number[], sur: number[] }}
 */
export const TICKET_ZONA = {
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  norte: [1180, 1220, 1290, 1240, 1310, 1380, 1350, 1420, 1460, 1390, 1510, 1580],
  sur:   [920,  950,  980,  970, 1010, 1050, 1020, 1080, 1100, 1070, 1140, 1190],
};

/**
 * Mock de ventas por temporada × categoría para VentasTemporadaChart.
 * `data` es una matriz rows×cols donde rows = [Primavera, Verano, Otoño, Invierno]
 * y cols = cats. SectionProductos la transforma a `stackedData` si el API falla.
 * El API devuelve directamente `{ stackedData, cats, colors }` pre-procesado.
 *
 * @type {{ cats: string[], colors: string[], data: number[][], stackedData?: Object[] }}
 */
export const SEASON_DATA = {
  cats: ['Playera', 'Pantalón', 'Sudadera', 'Vestido', 'Chamarra', 'Conjunto'],
  colors: ['#111111', '#A48F7A', '#D8C3A5', '#D9B8B0', '#8E9AAF', '#6E8B6B'],
  // rows = [primavera, verano, otoño, invierno], cols = cats
  data: [[95, 60, 20, 70, 30, 45], [120, 55, 10, 90, 15, 60], [70, 80, 85, 40, 55, 35], [50, 75, 110, 30, 95, 25]],
};

/**
 * Mock de distribución de unidades vendidas por talla para UnidadesTallaChart.
 * Solo incluye tallas letra — el backend devuelve ambos sistemas mezclados.
 *
 * @type {Array<{ name: string, value: number }>}
 */
export const TALLAS = [
  { name: 'CH', value: 2840 },
  { name: 'M', value: 5120 },
  { name: 'G', value: 4380 },
  { name: 'XG', value: 1960 },
  { name: 'Unitalla', value: 840 },
];

/**
 * Mock de rotación de inventario por categoría.
 * NOTA: No está conectado a ningún componente activo en la build actual.
 *
 * @type {Array<{ cat: string, rot: number }>}
 */
export const INVENTORY_ROTATION = [
  { cat: 'Playera', rot: 8.4 },
  { cat: 'Pantalón', rot: 6.2 },
  { cat: 'Sudadera', rot: 5.1 },
  { cat: 'Vestido', rot: 7.8 },
  { cat: 'Chamarra', rot: 3.9 },
  { cat: 'Blusa', rot: 6.7 },
  { cat: 'Conjunto', rot: 5.5 },
];

/**
 * Mock de comparación recibido vs vendido por categoría.
 * NOTA: No está conectado a ningún componente activo en la build actual.
 *
 * @type {Array<{ cat: string, recibido: number, vendido: number }>}
 */
export const RECIBIDO_VENDIDO = [
  { cat: 'Playera',  recibido: 4200, vendido: 3520 },
  { cat: 'Pantalón', recibido: 2800, vendido: 1740 },
  { cat: 'Sudadera', recibido: 1900, vendido: 970 },
  { cat: 'Vestido',  recibido: 2400, vendido: 1870 },
  { cat: 'Chamarra', recibido: 1100, vendido: 430 },
  { cat: 'Blusa',    recibido: 2200, vendido: 1480 },
  { cat: 'Conjunto', recibido: 1600, vendido: 1100 },
];

/**
 * Mock de descuento promedio por categoría.
 * NOTA: No está conectado a ningún componente activo en la build actual.
 *
 * @type {Array<{ cat: string, dcto: number }>}
 */
export const DCTO_CAT = [
  { cat: 'Chamarra', dcto: 22 },
  { cat: 'Sudadera', dcto: 18 },
  { cat: 'Pantalón', dcto: 9 },
  { cat: 'Vestido',  dcto: 11 },
  { cat: 'Conjunto', dcto: 10 },
  { cat: 'Blusa',    dcto: 7 },
  { cat: 'Playera',  dcto: 6 },
];

/**
 * Mock de ingresos por temporada de producto para VentasTrimestralChart.
 * @type {Array<{ season: string, value: number }>}
 */
export const QUARTERLY_REVENUE = [
  { season: 'Primavera', value: 300 },
  { season: 'Verano',    value: 150 },
  { season: 'Otoño',     value: 380 },
  { season: 'Invierno',  value: 310 },
];

/**
 * Mock de comparación festivos vs días normales para FestivosVsNormalesGrid.
 * El array contiene exactamente 4 tarjetas KPI en el orden que espera el componente:
 * ingreso festivo, ingreso normal, ratio, ticket promedio festivo.
 *
 * @type {Array<{ label: string, val: string, color: string, sub: string }>}
 */
export const FESTIVOS_DATA = [
  { label: 'Ingreso prom. festivo', val: '$4,820', color: '#C9963B', sub: 'por día' },
  { label: 'Ingreso prom. normal',  val: '$1,640', color: '#111',    sub: 'por día' },
  { label: 'Ratio festivo/normal',  val: '2.9×',   color: '#6E8B6B', sub: 'los festivos venden 2.9× más' },
  { label: 'Ticket prom. festivo',  val: '$1,390',  color: '#A48F7A', sub: 'vs $1,240 días normales' },
];

/**
 * Mock de KPIs de cobertura de inventario.
 * NOTA: No está conectado a ningún componente activo en la build actual.
 *
 * @type {Array<{ label: string, val: string, color: string }>}
 */
export const COVERAGE_KPIS = [
  { label: 'Días prom. cobertura', val: '38 días',   color: '#111' },
  { label: 'SKUs críticos (<7d)',  val: '7 SKUs',     color: '#B65E4A' },
  { label: 'SKUs en riesgo (<14d)', val: '12 SKUs',   color: '#C9963B' },
  { label: 'Sobrestock (>90d)',    val: '4 SKUs',     color: '#6E8B6B' },
];
