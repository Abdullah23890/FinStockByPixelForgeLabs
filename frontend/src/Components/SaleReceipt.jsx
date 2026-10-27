import "../Css/SaleReceipt.css";

const CHANNEL_LABELS = { retail: "Retail", wholeSale: "Wholesale"};

export default function SaleReceipt({ sale, settings }) {
  if (!sale) return null;

  const isThermal = sale.printSize === "thermal";
  const currency = "PKR";

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString() : "—";
  }

  function fmtMoney(n) {
    return `${currency} ${Number(n || 0).toLocaleString()}`;
  }

  return (
    <div
      id="sale-print-area"
      className={`pfl-receipt ${isThermal ? "pfl-receipt--thermal" : "pfl-receipt--a4"}`}
    >
      {/* Header */}
      <div className="pfl-receipt__header">
        {settings?.logo && (
          <img className="pfl-receipt__logo" src={settings.logo} alt={settings?.name || "Logo"} />
        )}
        <div className="pfl-receipt__business-name">{settings?.name || "Your Business"}</div>
        {settings?.address && <div className="pfl-receipt__meta-line">{settings.address}</div>}
        {settings?.phone && <div className="pfl-receipt__meta-line">{settings.phone}</div>}
      </div>

      <div className="pfl-receipt__divider" />

      {/* Sale info */}
      <div className="pfl-receipt__info">
        <div className="pfl-receipt__info-row">
          <span>Sale #</span>
          <strong>{sale.saleNumber}</strong>
        </div>
        <div className="pfl-receipt__info-row">
          <span>Date</span>
          <strong>{fmtDate(sale.saleDate || sale.createdAt)}</strong>
        </div>
        <div className="pfl-receipt__info-row">
          <span>Channel</span>
          <strong>{CHANNEL_LABELS[sale.channel] || sale.channel}</strong>
        </div>
        <div className="pfl-receipt__info-row">
          <span>Customer</span>
          <strong>{sale.customer?.name || "Walk-in"}</strong>
        </div>
      </div>

      <div className="pfl-receipt__divider" />

      {/* Items */}
      <table className="pfl-receipt__items">
        <thead>
          <tr>
            <th>Item</th>
            <th className="pfl-receipt__col-center">Qty</th>
            <th className="pfl-receipt__col-right">Price</th>
            <th className="pfl-receipt__col-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(sale.items || []).map((it, idx) => (
            <tr key={idx}>
              <td>{it.product?.name || "—"}</td>
              <td className="pfl-receipt__col-center">{it.quantity}</td>
              <td className="pfl-receipt__col-right">{fmtMoney(it.unitPrice)}</td>
              <td className="pfl-receipt__col-right">{fmtMoney(it.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pfl-receipt__divider" />

      {/* Totals */}
      <div className="pfl-receipt__totals">
        <div className="pfl-receipt__totals-row">
          <span>Subtotal</span>
          <span>{fmtMoney(sale.subTotal)}</span>
        </div>
        {Number(sale.discount) > 0 && (
          <div className="pfl-receipt__totals-row">
            <span>Discount</span>
            <span>- {fmtMoney(sale.discount)}</span>
          </div>
        )}
        {Number(sale.tax) > 0 && (
          <div className="pfl-receipt__totals-row">
            <span>Tax</span>
            <span>+ {fmtMoney(sale.tax)}</span>
          </div>
        )}
        <div className="pfl-receipt__totals-row pfl-receipt__totals-row--grand">
          <span>Total</span>
          <span>{fmtMoney(sale.totalAmount)}</span>
        </div>
        <div className="pfl-receipt__totals-row">
          <span>Paid</span>
          <span>{fmtMoney(sale.paidAmount)}</span>
        </div>
        {Number(sale.dueAmount) > 0 && (
          <div className="pfl-receipt__totals-row pfl-receipt__totals-row--due">
            <span>Due</span>
            <span>{fmtMoney(sale.dueAmount)}</span>
          </div>
        )}
      </div>

      <div className="pfl-receipt__divider" />

      {/* Footer */}
      <div className="pfl-receipt__footer">
        {settings?.printfooterText ? (
          <p>{settings.printfooterText}</p>
        ) : (
          <p>Thank you for your purchase!</p>
        )}
      </div>
    </div>
  );
}