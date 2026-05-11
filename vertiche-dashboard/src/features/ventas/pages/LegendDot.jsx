import './styles/LegendDot.css';

export function LegendDot({ color }) {
  return (
    <span
      className="legend-dot"
      style={{ background: color }}
    />
  );
}
