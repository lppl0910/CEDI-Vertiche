import { BAY_COLORS, BAY_STORES } from "../utils/constants";
import { useBaysContext } from "../context/BaysProvider";
import "./StoreConveyorScreen.css";

export function StoreConveyorScreen({ bay, personIdx }) {
  const { lastBelt } = useBaysContext();
  const current = lastBelt[bay.id];

  const stores = BAY_STORES[bay.id].slice(personIdx * 4, (personIdx * 4) + 4);
  const isForThisPerson = current && current.bayId === bay.id && stores.includes(current.store) && !current.isError;
  const bc = BAY_COLORS[bay.id];
  const isError = current?.isError;

  return (
    <div className="store-conveyor-screen">
      <div className="sc-header">
        <div>
          <div className="sc-title">CINTA DE DISTRIBUCIÓN ➔ PERSONA {personIdx + 1}</div>
          <div className="sc-subtitle">Bahía {bay.id} | Tiendas: {stores.join(", ")}</div>
        </div>
        {isForThisPerson && <div className="sc-badge incoming" style={{ background: bc }}>PAQUETE ENTRANTE</div>}
        {isError && <div className="sc-badge error">ERROR DE LECTURA</div>}
      </div>

      <div className="sc-stores-container">
        {stores.map(s => {
          const active = isForThisPerson && current.store === s;
          const errorActive = isError && current.store === s;
          return (
            <div
              key={s}
              className="sc-store-box"
              style={{
                background: active ? bc + "22" : errorActive ? "var(--red-transparent)" : "var(--surface)",
                border: `2px solid ${active ? bc : errorActive ? "var(--red)" : "var(--border)"}`,
                boxShadow: active ? `0 0 30px ${bc}33` : errorActive ? `0 0 30px rgba(248,113,113,0.2)` : "none"
              }}
            >
              <div className="sc-store-label">TIENDA</div>
              <div className="sc-store-number" style={{ color: active ? bc : errorActive ? "var(--red)" : "var(--text-mid)" }}>{s}</div>
            </div>
          );
        })}
      </div>

      <div
        className="sc-status-box"
        style={{
          background: isError ? "rgba(248,113,113,0.07)" : "var(--surface)",
          border: `1px solid ${isError ? "var(--red)" : "var(--border)"}`
        }}
      >
        {isForThisPerson ? (
          <div>
            <div className="sc-status-label" style={{ color: "var(--text-mid)" }}>PAQUETE ACTUAL ({current.pkgId}):</div>
            <div className="sc-status-text" style={{ color: bc }}>DIRIGIENDO A TIENDA {current.store}</div>
          </div>
        ) : isError ? (
          <div>
            <div className="sc-error-label">¡PAQUETE PASÓ DE LARGO! ({current.pkgId})</div>
            <div className="sc-error-text">PERTENECÍA A: BAHÍA {current.bayId} - TIENDA {current.store}</div>
          </div>
        ) : (
          <div className="sc-waiting-text">ESPERANDO PAQUETES PARA ESTAS TIENDAS...</div>
        )}
      </div>
    </div>
  );
}
