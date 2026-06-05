import { useState } from "react";
import { BAY_COLORS } from "../utils/constants";
import { ScannerLine } from "../components/ScannerLine";
import { PackageTable } from "../components/PackageTable";
import { PkgCard } from "../components/PkgCard";
import { useSorterContext } from "../context/SorterProvider";
import { usePinnedPackage } from "../hooks/usePinnedPackage";
import "./SorterScreen.css";

export function SorterScreen() {
  const { allPkgs: allPackages, lastEntry: current, animKeySorter: animKey, ppm } = useSorterContext();
  const { pinnedPkg, setPinnedPkg, handlePkgClick } = usePinnedPackage();
  const [selectedBay, setSelectedBay] = useState(null);

  const displayPkg = pinnedPkg || current;
  const isLive = !pinnedPkg;
  const bc = displayPkg ? BAY_COLORS[displayPkg.bayId] : "var(--green)";
  const listPackages = selectedBay ? allPackages.filter(p => p.bayId === selectedBay) : allPackages;

  return (
    <div className="sorter-screen">
      <div className="sorter-left-col">
        <div className="header-row">
          <div>
            <div className="label-title">SORTER ➔ BAHÍA</div>
            <div className="bay-number" style={{ color: bc }}>
              {displayPkg ? displayPkg.bayId : <span className="num-placeholder">—</span>}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="label-title">TIENDA</div>
            <div className="store-number">
              {displayPkg ? displayPkg.store : <span className="num-placeholder">—</span>}
            </div>
          </div>
        </div>

        <ScannerLine animKey={animKey} color={bc} />

        <div className="current-reading-label">
          {isLive ? (
            <span>
              LECTURA ACTUAL: <span className="current-reading-id">{current?.pkgId || "ESPERANDO..."}</span>
            </span>
          ) : (
            <span className="pinned-indicator">
              PAQUETE FIJADO: <span className="current-reading-id">{pinnedPkg.pkgId}</span>
            </span>
          )}
          {!isLive && (
            <button className="btn-live" onClick={() => setPinnedPkg(null)}>
              ◉ VOLVER A TIEMPO REAL
            </button>
          )}
        </div>

        <div className="package-table-wrapper scroll">
          <PackageTable pkg={displayPkg} />
        </div>

        <div className="section-label">ESTADO DE BAHÍAS</div>
        <div className="bays-filter-grid">
          {[1, 2, 3].map(bayId => {
            const isSel = selectedBay === bayId;
            const count = allPackages.filter(p => p.bayId === bayId).length;
            const color = BAY_COLORS[bayId];
            return (
              <div
                key={bayId}
                className="store-card-v3 bay-card"
                onClick={() => setSelectedBay(isSel ? null : bayId)}
                style={{ borderColor: isSel ? color : "var(--border)", background: isSel ? color + "15" : "" }}
              >
                <div className="bay-card-title">BAHÍA</div>
                <div className="bay-card-number" style={{ color: isSel ? color : "var(--text)" }}>{bayId}</div>
                <div className="bay-card-count" style={{ color: count > 0 ? color : "var(--text-dim)" }}>{count} PAQUETES</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sorter-right-col">
        <div className="performance-card">
          <div className="label-title">RENDIMIENTO GLOBAL</div>
          <div className="performance-value">
            {ppm} <span className="performance-unit">PAQUETES/MIN</span>
          </div>
        </div>

        <div className="history-header">
          <span className="label-title" style={{ marginBottom: 0 }}>
            {selectedBay ? `INVENTARIO BAHÍA ${selectedBay}` : "INVENTARIO GLOBAL"}
          </span>
          <span className="history-count-badge">{listPackages.length} PAQUETES</span>
        </div>

        <div className="scroll" style={{ flex: 1, overflowY: "auto" }}>
          {listPackages.map(pkg => (
            <PkgCard
              key={pkg.pkgId}
              pkg={pkg}
              isPinned={pinnedPkg?.pkgId === pkg.pkgId}
              onClick={() => handlePkgClick(pkg)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
