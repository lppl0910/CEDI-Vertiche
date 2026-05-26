import "../styles/FlechaIzquierda.css";

/**
 * Icono de flecha (apunta izquierda) como botón clickeable.
 * Usado por ComponenteEsquina para re-expandir el panel de fechas colapsado.
 *
 * @param {Object} props
 * @param {() => void} props.onClick - Callback al hacer click sobre el icono
 * @param {number} [props.size=25]   - Tamaño en px del SVG
 */
export const FlechaIzquierda = ({ onClick, size=25 }) => {
  return (
    <div className="flecha-izquierda" onClick={onClick}>
      <svg
        fill="#ffffff"
        height={`${size}px`}
        width={`${size}px`}
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 330 330"
        xmlSpace="preserve"
      >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g
          id="SVGRepo_tracerCarrier"
          strokeLinecap="round"
          strokeLinejoin="round"
        ></g>
        <g id="SVGRepo_iconCarrier">
          {" "}
          <path
            id="XMLID_92_"
            d="M111.213,165.004L250.607,25.607c5.858-5.858,5.858-15.355,0-21.213c-5.858-5.858-15.355-5.858-21.213,0.001 l-150,150.004C76.58,157.211,75,161.026,75,165.004c0,3.979,1.581,7.794,4.394,10.607l150,149.996 C232.322,328.536,236.161,330,240,330s7.678-1.464,10.607-4.394c5.858-5.858,5.858-15.355,0-21.213L111.213,165.004z"
          ></path>{" "}
        </g>
      </svg>
    </div>
  );
};
