import { useState } from "react";
import { BAY_STORES, BAY_COLORS } from "../utils/constants";
import { ScannerLine } from "../components/ScannerLine";
import { PackageTable } from "../components/PackageTable";
import { PkgCard } from "../components/PkgCard";
import { useBaysContext } from "../context/BaysProvider";
import { usePinnedPackage } from "../hooks/usePinnedPackage";
import "./OperationScreen.css";

export function OperationScreen({ bay }) {
  const { lastOperation, bayPkgs, bayErrors, animKeys } = useBaysContext();
  const current = lastOperation[bay.id];
  const packages = bayPkgs[bay.id] || [];
  const errorPkgs = bayErrors[bay.id] || [];
  const animKey = animKeys[bay.id];
  const bc = BAY_COLORS[bay.id];

  const [selectedStore, setSelectedStore] = useState(null);
  const { pinnedPkg, setPinnedPkg, handlePkgClick } = usePinnedPackage();

  const storeGroups = [
    BAY_STORES[bay.id].slice(0, 4),
    BAY_STORES[bay.id].slice(4, 8),
    BAY_STORES[bay.id].slice(8, 12)
  ];

  const currentInBay = current && current.bayId === bay.id && !current.isError;
  const displayPkg = pinnedPkg || (currentInBay ? current : null);
  const isLive = !pinnedPkg;
  const listPackages = selectedStore ? packages.filter(p => p.store === selectedStore) : packages;

  return (
    <div className="operation-screen">
      <div className="operation-left-col">
        <div className="dashboard-header">
          <div>
            <div className="monitor-title">MONITOR {bay.label}</div>
            <div className="monitor-bay-number" style={{ color: bc }}>{bay.id}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="monitor-title">{isLive ? "ACTUAL" : "FIJADO"}</div>
            <div className="monitor-current-store">
              {displayPkg ? "T-" + displayPkg.store : <span className="num-placeholder">—</span>}
            </div>
          </div>
        </div>

        <ScannerLine animKey={animKey} color={currentInBay ? bc : "var(--border)"} />

        <div className="monitor-reading-label">
          {isLive ? (
            <span>
              LECTURA ACTUAL: <span className="monitor-reading-id">{currentInBay ? current.pkgId : "ESPERANDO..."}</span>
            </span>
          ) : (
            <span className="pinned-indicator">
              PAQUETE FIJADO: <span className="monitor-reading-id">{pinnedPkg.pkgId}</span>
            </span>
          )}
          {!isLive && (
            <button className="btn-live" onClick={() => setPinnedPkg(null)}>
              ◉ VOLVER A TIEMPO REAL
            </button>
          )}
        </div>

        <div className="monitor-package-table-wrapper scroll">
          <PackageTable pkg={displayPkg} />
        </div>

        <div className="grid-title">TIENDAS</div>
        <div className="store-grid-container">
          {storeGroups.map((group, rowIdx) => (
            <div key={rowIdx} className="store-grid-row">
              {group.map(sid => {
                const count = packages.filter(p => p.store === sid).length;
                const isSel = selectedStore === sid;
                const isWork = currentInBay && current.store === sid;
                let cardClass = "store-card-v3 dashboard-store-card";
                if (isSel) cardClass += " selected";
                if (isWork) cardClass += " working";

                return (
                  <div
                    key={sid}
                    className={cardClass}
                    onClick={() => setSelectedStore(isSel ? null : sid)}
                    style={{
                      borderColor: isSel ? bc : isWork ? "var(--text)" : "var(--border)",
                      background: isSel ? bc + "15" : ""
                    }}
                  >
                    <div className="card-label">TIENDA</div>
                    <div className="card-number" style={{ color: isSel ? bc : "var(--text)" }}>{sid}</div>
                    <div className="card-count" style={{ color: count > 0 ? "var(--green)" : "var(--text-dim)" }}>
                      {count} PAQUETES
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="operation-right-col">
        <div className="dashboard-history-header">
          <span className="dashboard-history-title">{selectedStore ? `TIENDA ${selectedStore}` : "HISTORIAL BAHÍA"}</span>
          <span className="dashboard-history-count" style={{ background: bc }}>{listPackages.length} PAQUETES</span>
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

        {errorPkgs.length > 0 && (
          <div className="error-log-section">
            <div className="error-log-header">
              <span className="error-log-title">⚠ DESVÍOS DETECTADOS</span>
              <span className="error-log-count">{errorPkgs.length}</span>
            </div>
            <div className="error-log-list scroll">
              {errorPkgs.map(pkg => (
                <div key={pkg.pkgId} className="error-log-entry" onClick={() => handlePkgClick(pkg)}>
                  <div className="error-log-entry-header">
                    <span className="error-log-pkg-id">{pkg.pkgId}</span>
                    <span className="error-log-store">T-{pkg.store}</span>
                  </div>
                  <div className="error-log-detail">
                    Debía ir a Bahía {pkg.intendedBay || "?"} → Llegó a Bahía {pkg.bayId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
