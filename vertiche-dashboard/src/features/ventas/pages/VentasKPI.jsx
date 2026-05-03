import { KPI_COLORS } from './CONSTANTES';
import './styles/VentasKPI.css';

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
