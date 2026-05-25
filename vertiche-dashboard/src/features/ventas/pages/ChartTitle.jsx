import './styles/ChartTitle.css';

/**
 * Encabezado estándar para gráficas: título principal y subtítulo opcional.
 *
 * @param {Object} props
 * @param {string} props.title    - Título principal del chart
 * @param {string} [props.sub]    - Descripción o aclaración; no se renderiza si es falsy
 */
export function ChartTitle({ title, sub }) {
  return (
    <div className="chart-title">
      <div className="chart-title__heading">{title}</div>
      {sub && <div className="chart-title__sub">{sub}</div>}
    </div>
  );
}
