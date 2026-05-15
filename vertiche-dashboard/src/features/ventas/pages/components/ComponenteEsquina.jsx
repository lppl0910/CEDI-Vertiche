import { useState } from "react";
import "../styles/ComponenteEsquina.css";

const ComponenteEsquina = ({ periodoParametro }) => {
  const [estadoVisible, setEstadoVisible] = useState(true);

  const cambiarEstadoComponenteEsq = () => {
    setEstadoVisible(!estadoVisible);
  };

  const objFechaHoy = new Date();
  const fechaHoyEnMs = objFechaHoy.getTime();
  const msPorDia = 8.64e7;

  const periodDays = { "7d": 7, "30d": 30, "90d": 90 };
  const periodo = periodDays[periodoParametro] ?? 365;

  const locale = "es-MX";
  const opcionesFecha = { year: "numeric", month: "long", day: "numeric" };
  const strFechaPeriodo = new Date(
    fechaHoyEnMs - msPorDia * periodo,
  ).toLocaleDateString(locale, opcionesFecha);
  const strFechaHoy = objFechaHoy.toLocaleDateString(locale, opcionesFecha);

  return (
    <div className="componente-esquina" onClick={cambiarEstadoComponenteEsq}>
      {estadoVisible ? (
        <>
          <p>Fechas seleccionadas:</p>
          <p>{strFechaPeriodo}</p>
          <p>al</p>
          <p>{strFechaHoy}</p>
        </>
      ) : (
        <>...</>
      )}
    </div>
  );
};



export default ComponenteEsquina;
