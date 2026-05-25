import './styles/TwoCol.css';

/**
 * Layout de dos columnas con gap uniforme para colocar gráficas en pares.
 * En pantallas pequeñas colapsa a una columna (ver TwoCol.css).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Se esperan exactamente 2 nodos hijos.
 */
export function TwoCol({ children }) {
  return (
    <div className="two-col">
      {children}
    </div>
  );
}
