import "../Css/ReportPrintable.css";

function isFinancialLabel(label = "") {
  const l = label.toLowerCase();
  return (
    l.includes("sale") ||
    l.includes("purchase") ||
    l.includes("due") ||
    l.includes("payable") ||
    l.includes("receivable") ||
    l.includes("outstanding") ||
    l.includes("profit") ||
    l.includes("expense") ||
    l.includes("remaining") ||
    l.includes("revenue") ||
    l.includes("credit") ||
    l.includes("refund") ||
    l.includes("amount")
  ) && !l.includes("count");
}

export default function ReportPrintable({ title, settings, columns, rows, summary, isOverview = false, overviewData }) {
  function fmtVal(val, isMoney) {
    if (val == null) return "—";
    return isMoney ? `PKR ${Number(val).toLocaleString()}` : val;
  }

  return (
    <div id="report-print-area" className="pfl-report">
      <div className="pfl-report__header">
        {settings?.logo && <img src={settings.logo} alt={settings?.companyName || settings?.name} className="pfl-report__logo" />}
        <div>
          <div className="pfl-report__business-name">{settings?.companyName || settings?.name || "Your Business"}</div>
          {settings?.address && <div className="pfl-report__meta">{settings.address}</div>}
          {settings?.phone && <div className="pfl-report__meta">{settings.phone}</div>}
        </div>
      </div>

      <h2 className="pfl-report__title">{title}</h2>
      <div className="pfl-report__date">Generated on {new Date().toLocaleDateString()}</div>

      {isOverview && overviewData && (
        <div className="pfl-report__overview-grid">
          {Object.entries(overviewData).map(([label, value]) => (
            <div className="pfl-report__overview-card" key={label}>
              <span className="pfl-report__overview-label">{label}</span>
              <span className="pfl-report__overview-value">PKR {Number(value || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {columns && rows && (
        <>
          <table className="pfl-report__table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="pfl-report__empty">
                    No data found for the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr key={idx}>
                    {columns.map((c) => (
                      <td key={c.key}>{fmtVal(row[c.key], c.money)}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {summary && (
            <div className="pfl-report__summary">
              {Object.entries(summary).map(([label, value]) => (
                <div key={label}>
                  <span>{label}</span>
                  <strong>
                    {isFinancialLabel(label)
                      ? `PKR ${Number(value || 0).toLocaleString()}`
                      : typeof value === "number"
                      ? Number(value).toLocaleString()
                      : value}
                  </strong>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}