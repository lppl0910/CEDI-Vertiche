import './styles/Card.css';

/**
 * Contenedor de tarjeta base para todos los gráficos y tablas del feature ventas.
 * La prop `style` permite overrides puntuales sin necesidad de crear variantes CSS.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {React.CSSProperties} [props.style]
 */
export function Card({ children, style }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}
