import './styles/Card.css';

/* style prop se mantiene para overrides puntuales del consumidor */
export function Card({ children, style }) {
  return (
    <div className="card" style={style}>
      {children}
    </div>
  );
}
