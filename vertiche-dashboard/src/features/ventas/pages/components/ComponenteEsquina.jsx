import { useContext, useState } from "react";
import { ContextoFiltros } from "../Contexto";
import "../styles/ComponenteEsquina.css";
import { FlechaIzquierda } from "./FlechaIzquierda.jsx";

/**
 * Indicador de rango de fechas del periodo activo, ubicado en la esquina superior
 * de la página de ventas. Colapsa a un ícono de flecha al hacer click para liberar espacio.
 *
 * Calcula la fecha de inicio restando los días del periodo a la fecha de hoy.
 * '1y' no está en el mapa periodDays — usa 365 días como fallback.
 *
 * @param {Object} props
 * @param {'7d'|'30d'|'90d'|'1y'} props.periodoParametro - Periodo seleccionado en el filtro global
 */
const ComponenteEsquina = () => {
  const { period: periodoParametro } = useContext(ContextoFiltros);
  const [estadoVisible, setEstadoVisible] = useState(true);

  const cambiarEstadoComponenteEsq = () => {
    setEstadoVisible(!estadoVisible);
  };

  const objFechaHoy = new Date();
  const fechaHoyEnMs = objFechaHoy.getTime();
  const msPorDia = 8.64e7;

  const periodDays = { "7d": 7, "30d": 30, "90d": 90 };
  // '1y' no está en el mapa — 365 días cubre el caso sin lógica extra.
  const periodo = periodDays[periodoParametro] ?? 365;

  const locale = "es-MX";
  const opcionesFecha = { year: "numeric", month: "long", day: "numeric" };
  const strFechaPeriodo = new Date(
    fechaHoyEnMs - msPorDia * periodo,
  ).toLocaleDateString(locale, opcionesFecha);
  const strFechaHoy = objFechaHoy.toLocaleDateString(locale, opcionesFecha);

  return (
    <div>
      {estadoVisible ? (
        <div className="componente-esquina" onClick={cambiarEstadoComponenteEsq}>
          <p>Fechas seleccionadas:</p>
          <p>{strFechaPeriodo}</p>
          <p>al</p>
          <p>{strFechaHoy}</p>
        </div>
      ) : (
        <FlechaIzquierda onClick={cambiarEstadoComponenteEsq} size={30}/>
      )}
    </div>
  );
};

export default ComponenteEsquina;
