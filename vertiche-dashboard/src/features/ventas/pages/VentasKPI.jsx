import { KPI_COLORS } from './CONSTANTES';
import './styles/VentasKPI.css';

/**
 * Tarjeta individual de KPI para la sección de Performance.
 * Muestra una barra de color lateral, el valor principal, subtítulo opcional y delta.
 *
 * @param {Object} props
 * @param {Object} props.kpi - Objeto KPI tal como llega del endpoint /performance
 * @param {string} props.kpi.label  - Etiqueta del KPI (e.g. 'Ingresos Totales')
 * @param {string} props.kpi.value  - Valor ya formateado (e.g. '$1.66M', '14,280')
 * @param {string} [props.kpi.sub]  - Subtítulo opcional (e.g. fórmula SQL de origen del dato)
 * @param {string} props.kpi.delta  - Variación vs periodo anterior, ya formateada (e.g. '+18.2%')
 * @param {boolean} props.kpi.pos   - true si el delta es favorable (triángulo ▲ en verde)
 * @param {'c1'|'c2'|'c3'|'c4'|'c5'} props.kpi.cl - Clave de color; mapeada via KPI_COLORS
 */
export function VentasKPI({ kpi }) {
  return (
    <div className="ventas-kpi">
      {/* background dinámico según tipo de KPI */}
      <div
        className="ventas-kpi__color-bar"
        style={{ background: KPI_COLORS[kpi.cl] || 'var(--c-black)' }}
      />
      <div className="ventas-kpi__label">{kpi.label}</div>
      <div className="ventas-kpi__value">{kpi.value}</div>
      {kpi.sub && <div className="ventas-kpi__sub">{kpi.sub}</div>}
      <div className={`ventas-kpi__delta ${kpi.pos ? 'ventas-kpi__delta--positive' : 'ventas-kpi__delta--negative'}`}>
        {kpi.pos ? '▲' : '▼'} {kpi.delta}
      </div>
    </div>
  );
}
