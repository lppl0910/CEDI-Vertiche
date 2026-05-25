import './styles/SectionSep.css';

/**
 * Separador visual de sección: etiqueta de texto + línea horizontal decorativa.
 * Marca el inicio de cada bloque temático en la página de ventas.
 *
 * @param {Object} props
 * @param {string} props.label - Título de la sección (e.g. 'Tendencias Temporales')
 */
export function SectionSep({ label }) {
  return (
    <div className="section-sep">
      <span className="section-sep__label">{label}</span>
      <div className="section-sep__line" />
    </div>
  );
}
