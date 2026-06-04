import "./ScannerLine.css";

export function ScannerLine({ animKey, color = "var(--green)" }) {
  return (
    <div className="scanner-container">
      {}
      <div key={animKey} className="scanner-beam" style={{ background: color }} />
    </div>
  );
}
