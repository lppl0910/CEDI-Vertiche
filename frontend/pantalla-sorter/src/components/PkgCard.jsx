import { BAY_COLORS } from "../utils/constants";

export function PkgCard({ pkg, isPinned, onClick }) {
  const borderColor = pkg.isError ? "var(--red)" : BAY_COLORS[pkg.bayId];
  return (
    <div
      className={`pkg-card ${isPinned ? "pkg-card--pinned" : ""} ${pkg.isError ? "pkg-card--error" : ""}`}
      style={{ borderLeft: `4px solid ${borderColor}` }}
      onClick={onClick}
    >
      <div className="pkg-card-header">
        <span>{pkg.pkgId}</span>
        <span className="pkg-card-store">T-{pkg.store}</span>
      </div>
      <div className="pkg-card-meta">
        {pkg.garment.name} · {pkg.rows.length} refs
        {pkg.isError && <span className="pkg-error-badge">⚠ DESVIADO</span>}
        {isPinned && <span className="pkg-pinned-badge">📌 FIJADO</span>}
      </div>
    </div>
  );
}
