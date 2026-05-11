import "../styles/ComponenteEsquina.css";

const ComponenteEsquina = ({ fechaPeriodo, fechaHoy }) => {
  return(
    <div className="componente-esquina">
      <p>Fechas seleccionadas:</p>
      <p>{fechaPeriodo}</p>
      <p>al</p>
      <p>{fechaHoy}</p>
    </div>
  );
}

export default ComponenteEsquina;