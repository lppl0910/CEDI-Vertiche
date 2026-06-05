import "./PackageTable.css";

export function PackageTable({ pkg }) {
  if (!pkg) return <div className="no-data">SIN DATOS DE LECTURA</div>;

  return (
    <div className="package-table-container">
      <table className="package-table">
        <thead>
          <tr>
            {["ID", "Artículo", "Color", "Talla", "Cant."].map((h, i) => (
              <th key={h} className={i === 4 ? "align-right" : ""}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pkg.rows.map((row, i) => (
            <tr key={i}>
              <td className="col-id">{row.id}</td>
              <td>{row.name}</td>
              <td>
                <div className="color-indicator-wrapper">
                  <span className="color-dot" style={{ background: row.color.hex }} />
                  {row.color.name}
                </div>
              </td>
              <td className="col-size">{row.size}</td>
              <td className="col-qty">{row.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
