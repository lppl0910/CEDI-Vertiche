import { useBaysContext } from "../context/BaysProvider";
import "./BayConveyorScreen.css";

export function BayConveyorScreen({ bay }) {
  const { lastBelt } = useBaysContext();
  const current = lastBelt[bay.id];

  const isHere = current?.bayId === bay.id && !current?.isError;
  const isOther = current && current.bayId !== bay.id && !current?.isError;
  const isErr = current?.isError;

  let bg = "var(--surface)",
      borderColor = "var(--border)",
      msg = "CINTA LISTA",
      msgColor = "var(--text-dim)";

  if (isHere) {
    bg = "rgba(74, 222, 128, 0.07)";
    borderColor = "var(--green)";
    msg = "PAQUETE PARA ESTA BAHÍA";
    msgColor = "var(--green)";
  } else if (isOther) {
    bg = "var(--surface)";
    borderColor = "var(--border)";
    msg = "PAQUETE AJENO";
    msgColor = "var(--text-dim)";
  } else if (isErr) {
    bg = "rgba(248, 113, 113, 0.15)";
    borderColor = "var(--red)";
    msg = current.intendedBay && current.intendedBay !== bay.id
      ? `¡PAQUETE DESVIADO! (ERA PARA BAHÍA ${current.intendedBay})`
      : "ERROR DE LECTURA / PROCESO";
    msgColor = "var(--red)";
  }

  return (
    <div className="bay-conveyor-screen">
      <div className="bc-title">CINTA PRINCIPAL (SORTER ➔ BAHÍAS)</div>

      <div className="bc-status-box" style={{ background: bg, border: `2px solid ${borderColor}` }}>
        {current ? (
          <div>
            <div className="bc-pkg-id">ID: {current.pkgId}</div>
            <div className="bc-msg" style={{ color: msgColor }}>{msg}</div>
            {isOther && (
              <div className="bc-other-bay">Se dirige hacia la Bahía {current.bayId}</div>
            )}
            {isHere && (
              <div className="bc-destination">DESTINO: TIENDA {current.store}</div>
            )}
          </div>
        ) : (
          <div className="bc-waiting">ESPERANDO PAQUETE...</div>
        )}
      </div>
    </div>
  );
}
