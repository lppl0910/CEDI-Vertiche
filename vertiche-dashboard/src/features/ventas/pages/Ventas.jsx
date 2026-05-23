import { useState } from "react";
import { SectionPerformance } from "./SectionPerformance";
import { SectionTendencias } from "./SectionTendencias";
import { SectionProductos } from "./SectionProductos";
import { SectionTiendas } from "./SectionTiendas";
import { ChartStatus } from "./components/ChartStatus";
import { ChatFAB } from "./ChatFAB";
import ComponenteEsquina from "./components/ComponenteEsquina";
import "./styles/Ventas.css";

// eslint-disable-next-line react-refresh/only-export-components
export const SECTIONS = {
  tendencias: SectionTendencias,
  productos:  SectionProductos,
  tiendas:    SectionTiendas,
};

export default function Ventas({
  section  = "tendencias",
  filters  = { period: "30d", zona: "all", temporada: "all" },
}) {
  const [perfStatus,    setPerfStatus]    = useState("loading");
  const [sectionStatus, setSectionStatus] = useState("loading");

  const ActiveSection = SECTIONS[section] || SectionTendencias;

  const globalError = perfStatus === "error" && sectionStatus === "error";

  return (
    <div className="ventas">
      <ComponenteEsquina periodoParametro={filters.period} />

      {globalError ? (
        <div className="ventas__global-error">
          <ChartStatus
            type="error"
            message="No se pudo conectar con el servidor. Por favor, refresque la página."
          />
        </div>
      ) : (
        <>
          <SectionPerformance
            filters={filters}
            onStatusChange={setPerfStatus}
          />
          <ActiveSection
            filters={filters}
            onStatusChange={setSectionStatus}
          />
        </>
      )}

      <ChatFAB />
    </div>
  );
}
