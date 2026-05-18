export function ChartStatus({ type, message, onRetry }) {
  const isError = type === 'error';
  return (
    <div className={`chart-status chart-status--${type}`}>
      <span className="chart-status__icon">{isError ? '⚠️' : '📭'}</span>
      <p className="chart-status__title">
        {isError ? 'No se pudo cargar' : 'Sin datos disponibles'}
      </p>
      <p className="chart-status__sub">
        {isError ? (message ?? 'Error al conectar con el servidor')
                 : 'No hay información para este período o filtro'}
      </p>
      {isError && onRetry && (
        <button className="chart-status__retry" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  );
}