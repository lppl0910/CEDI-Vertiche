import './styles/ChartTitle.css';

export function ChartTitle({ title, sub }) {
  return (
    <div className="chart-title">
      <div className="chart-title__heading">{title}</div>
      {sub && <div className="chart-title__sub">{sub}</div>}
    </div>
  );
}
