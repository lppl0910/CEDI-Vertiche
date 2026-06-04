import { useState } from "react";
import { ContextoFiltros } from "./Contexto";
import { SectionPerformance } from "./SectionPerformance";
import { SectionTendencias } from "./SectionTendencias";
import { SectionProductos } from "./SectionProductos";
import { SectionTiendas } from "./SectionTiendas";
import { ChartStatus } from "./components/ChartStatus";
import { ChatFAB } from "./ChatFAB";
import ComponenteEsquina from "./components/ComponenteEsquina";
import "./styles/Ventas.css";

/**
 * Mapa de sección activa a componente React correspondiente.
 * Agregar una nueva sección solo requiere registrarla aquí — Ventas la resolverá automáticamente.
 * @type {{ tendencias: React.FC, productos: React.FC, tiendas: React.FC }}
 */
// eslint-disable-next-line react-refresh/only-export-components
export const SECTIONS = {
  tendencias: SectionTendencias,
  productos:  SectionProductos,
  tiendas:    SectionTiendas,
};

/**
 * Componente raíz del módulo de análisis de ventas.
 *
 * Maneja dos capas de error independientes:
 *   perfStatus    — estado de SectionPerformance (KPIs siempre visibles arriba)
 *   sectionStatus — estado de la sección activa (tendencias/productos/tiendas)
 * El error global solo se muestra cuando AMBAS capas fallan simultáneamente,
 * evitando bloquear toda la vista si solo un endpoint falla.
 *
 * @param {Object} props
 * @param {'tendencias'|'productos'|'tiendas'} [props.section='tendencias']
 *   Sección activa. Controlada desde el router o el sidebar del dashboard.
 * @param {{ period?: string, zona?: string, temporada?: string }} [props.filters]
 */
export default function Ventas({
  section  = "tendencias",
  filters  = { period: "30d", zona: "all", temporada: "all" },
}) {
  const [perfStatus,    setPerfStatus]    = useState("loading");
  const [sectionStatus, setSectionStatus] = useState("loading");

  const ActiveSection = SECTIONS[section] || SectionTendencias;

  const globalError = perfStatus === "error" && sectionStatus === "error";

  return (
    <ContextoFiltros.Provider value={filters}>
      <div className="ventas">
        <ComponenteEsquina />

        {globalError ? (
          <div className="ventas__global-error">
            <ChartStatus
              type="error"
              message="No se pudo conectar con el servidor. Por favor, refresque la página."
            />
          </div>
        ) : (
          <>
            <SectionPerformance onStatusChange={setPerfStatus} />
            <ActiveSection     onStatusChange={setSectionStatus} />
          </>
        )}

        <ChatFAB />
      </div>
    </ContextoFiltros.Provider>
  );
}
