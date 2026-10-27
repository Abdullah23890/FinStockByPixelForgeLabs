import "../Css/SaleReturnView.css";

export default function PurchaseReturnView({ purchaseReturn, onClose }) {
  if (!purchaseReturn) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-retview">
      <div className="pfl-retview__head">
        <div>
          <h4>{purchaseReturn.returnNo}</h4>
          <span className="pfl-retview__sub">Against {purchaseReturn.purchase?.purchaseNumber || "—"}</span>
        </div>
        <span className="pfl-retview__refund-tag">{purchaseReturn.refundMethod || "—"}</span>
      </div>

      <div className="pfl-retview__meta">
        <div>
          <label>Supplier</label>
          <span>{purchaseReturn.supplier?.name || "—"}  {purchaseReturn.supplier?.contactNo || "—"}</span>
        </div>

        <div>
          <label>Date</label>
          <span>{fmtDate(purchaseReturn.createdAt)}</span>
        </div>
        <div>
          <label>Created By</label>
          <span>{purchaseReturn.createdBy?.name || "—"}</span>
        </div>
      </div>

      {purchaseReturn.reason && (
        <div className="pfl-retview__reason">
          <label>Reason</label>
          <p>{purchaseReturn.reason}</p>
        </div>
      )}

      <table className="pfl-retview__items">
        <thead>
          <tr>
            <th>Product</th>
            <th>Batch</th>
            <th className="pfl-retview__col-center">Qty</th>
            <th className="pfl-retview__col-right">Unit Price</th>
            <th className="pfl-retview__col-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(purchaseReturn.items || []).map((it, idx) => (
            <tr key={idx}>
              <td>{it.product?.name || "—"}</td>
              <td className="pfl-retview__batchno">{it.batch?.batchNo || "—"}</td>
              <td className="pfl-retview__col-center">{it.quantity}</td>
              <td className="pfl-retview__col-right">PKR {Number(it.unitPrice || 0).toLocaleString()}</td>
              <td className="pfl-retview__col-right pfl-retview__amount-cell">
                PKR {Number(it.total || 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pfl-retview__totals">
        <div className="pfl-retview__grand">
          <span>Total Refund</span>
          <strong>PKR {Number(purchaseReturn.totalAmount || 0).toLocaleString()}</strong>
        </div>
      </div>

      <div className="pfl-retview__actions">
        <button className="pfl-return__btn pfl-return__btn--ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}