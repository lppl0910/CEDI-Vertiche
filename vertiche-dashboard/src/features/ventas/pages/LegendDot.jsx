import './styles/LegendDot.css';

/**
 * Punto de leyenda de color para identificar series en gráficas.
 * Se usa inline junto con texto en los encabezados de charts.
 *
 * @param {Object} props
 * @param {string} props.color - Valor CSS de color (hex o variable CSS)
 */
export function LegendDot({ color }) {
  return (
    <span
      className="legend-dot"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
