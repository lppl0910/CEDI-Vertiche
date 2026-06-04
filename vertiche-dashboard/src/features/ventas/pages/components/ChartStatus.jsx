import "../styles/ChartStatus.css";

/**
 * Estado vacío o de error para un chart individual o una sección completa.
 * type='error' muestra el mensaje técnico y la instrucción de refrescar la página.
 * type='empty' no muestra botón de reintento — la acción esperada es cambiar los filtros.
 *
 * @param {Object} props
 * @param {'error'|'empty'} props.type    - Determina ícono, título y mensaje
 * @param {string} [props.message]        - Mensaje técnico adicional (solo visible en type='error')
 */
export function ChartStatus({ type, message }) {
  const isError = type === 'error';
  return (
    <div className={`chart-status chart-status--${type}`}>
      <span className="chart-status__icon" aria-hidden="true">{isError ? '⚠️' : '📭'}</span>
      <p className="chart-status__title">
        {isError ? 'No se pudo cargar' : 'Sin datos disponibles'}
      </p>
      <p className="chart-status__sub">
        {isError ? (message ?? 'Error al conectar con el servidor')
                 : 'No hay información para este período o filtro'}
      </p>
      {isError && (
        <p className="chart-status__retry">
          Espere un momento y refresque la página
        </p>
      )}
    </div>
  );
}