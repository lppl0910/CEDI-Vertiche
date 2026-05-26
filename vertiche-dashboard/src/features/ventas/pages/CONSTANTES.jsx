
/**
 * Paleta de colores compartida por todos los componentes del feature ventas.
 * Todos los valores de color deben provenir de aquí — no usar hex inline —
 * para mantener consistencia visual y facilitar futuros cambios de tema.
 *
 * @type {Object}
 * @property {string} black   - Negro principal (#111111); series A / datos primarios / Zona Norte
 * @property {string} taupe   - Taupe (#A48F7A); series B / Zona Sur
 * @property {string} blush   - Salmón claro (#D9B8B0); series C / KPI terciario
 * @property {string} beige   - Beige (#D8C3A5); fondos de leyenda / segmento C en Pareto
 * @property {string} success - Verde (#6E8B6B); deltas positivos / mapa zona "all"
 * @property {string} warning - Ámbar (#C9963B); alertas de stock / festivos
 * @property {string} error   - Rojo (#B65E4A); KPI negativo / estado de error en UI
 * @property {string} muted   - Gris medio (#6B6B6B); etiquetas de ejes y textos secundarios
 * @property {string} border  - Gris borde (#E7E2DC); divisores y bordes de tarjeta
 * @property {string} bg      - Fondo de página (#F8F6F3)
 * @property {string} card    - Fondo de tarjeta (#FFFFFF)
 */
export const C = {
  black: '#111111', taupe: '#A48F7A', blush: '#D9B8B0',
  beige: '#D8C3A5', success: '#6E8B6B', warning: '#C9963B',
  error: '#B65E4A', muted: '#6B6B6B', border: '#E7E2DC',
  bg: '#F8F6F3', card: '#FFFFFF',
};

/**
 * Mapa de clave de color a hex para las tarjetas KPI.
 * El backend incluye `cl: 'c1'...'c5'` en cada objeto KPI del array `/performance`;
 * este mapa traduce esa clave al color de la barra lateral de VentasKPI.
 *
 * @type {{ c1: string, c2: string, c3: string, c4: string, c5: string }}
 */
export const KPI_COLORS = { c1: C.black, c2: C.taupe, c3: C.blush, c4: C.success, c5: C.error };

/**
 * Estilo base para etiquetas de ejes en gráficas Recharts.
 * Se pasa como spread a la prop `tick` de XAxis/YAxis: `<XAxis tick={{ ...ax }} />`.
 *
 * @type {{ fontSize: number, fill: string, fontFamily: string }}
 */
export const ax = { fontSize: 11, fill: C.muted, fontFamily: 'Inter, sans-serif' };

/**
 * Estilo de cuadrícula de fondo para gráficas Recharts.
 * Se pasa como spread a CartesianGrid: `<CartesianGrid {...grid} />`.
 *
 * @type {{ stroke: string }}
 */
export const grid = { stroke: 'rgba(0,0,0,0.04)' };
