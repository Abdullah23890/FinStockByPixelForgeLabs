import "../Css/SaleReturnView.css";

export default function SaleReturnView({ saleReturn, onClose }) {
  if (!saleReturn) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-retview">
      <div className="pfl-retview__head">
        <div>
          <h4>{saleReturn.returnNo}</h4>
          <span className="pfl-retview__sub">Against {saleReturn.sale?.saleNumber || "—"}</span>
        </div>
        <span className="pfl-retview__refund-tag">{saleReturn.refundMethod || "—"}</span>
      </div>

      <div className="pfl-retview__meta">
        <div>
          <label>Customer</label>
          <span>{saleReturn.customer?.name || "Walk-in"}</span>
        </div>
        <div>
          <label>Date</label>
          <span>{fmtDate(saleReturn.createdAt)}</span>
        </div>
        <div>
          <label>Channel</label>
          <span>{saleReturn.channel || "—"}</span>
        </div>
        <div>
          <label>Created By</label>
          <span>{saleReturn.createdBy?.name || "—"} - {saleReturn.createdBy?.role || "—"}</span>
        </div>
      </div>

      {saleReturn.reason && (
        <div className="pfl-retview__reason">
          <label>Reason</label>
          <p>{saleReturn.reason}</p>
        </div>
      )}

      <table className="pfl-retview__items">
        <thead>
          <tr>
            <th>Product</th>
            <th>Batch</th>
            <th className="pfl-retview__col-center">Qty</th>
            <th className="pfl-retview__col-right">Unit Price</th>
            <th className="pfl-retview__col-right">Discount</th>
            <th className="pfl-retview__col-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {(saleReturn.items || []).map((it, idx) => (
            <tr key={idx}>
              <td>{it.product?.name || "—"}</td>
              <td className="pfl-retview__batchno">{it.batch?.batchNo || "—"}</td>
              <td className="pfl-retview__col-center">{it.quantity}</td>
              <td className="pfl-retview__col-right">PKR {Number(it.unitPrice || 0).toLocaleString()}</td>
              <td className="pfl-retview__col-right">PKR {Number(it.discount || 0).toLocaleString()}</td>
              <td className="pfl-retview__col-right pfl-retview__amount-cell">
                PKR {Number(it.total || 0).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pfl-retview__totals">
        <div>
          <span>Subtotal</span>
          <strong>PKR {Number(saleReturn.subTotal || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>Discount</span>
          <strong>PKR {Number(saleReturn.discount || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>Tax</span>
          <strong>PKR {Number(saleReturn.tax || 0).toLocaleString()}</strong>
        </div>
        <div className="pfl-retview__grand">
          <span>Total Refund</span>
          <strong>PKR {Number(saleReturn.totalAmount || 0).toLocaleString()}</strong>
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