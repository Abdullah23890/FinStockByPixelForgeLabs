import "../Css/PurchaseView.css";

function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : "—";
}

export default function PurchaseView({ purchase, onClose, onAddPayment, onReturn }) {
  if (!purchase) return null;

  const statusLabel = { paid: "Paid", partial: "Partial", unPaid: "Unpaid" };

  return (
    <div className="pfl-purview">
      <div className="pfl-purview__head">
        <div>
          <h4>{purchase.purchaseNumber}</h4>
          <span className="pfl-purview__supplier">{purchase.supplier?.name || "—"}</span>
        </div>
        <span className={`pfl-purview__status pfl-purview__status--${purchase.status}`}>
          {statusLabel[purchase.status] || purchase.status}
        </span>
      </div>

      <div className="pfl-purview__meta">
        <div>
          <label>Purchase Date</label>
          <span>{purchase.purchaseDate ? new Date(purchase.purchaseDate).toLocaleDateString() : "—"}</span>
        </div>
        <div>
          <label>Created By</label>
          <span>{purchase.createdBy?.name || "—"} - {purchase.createdBy?.role || "—"}</span>
        </div>
        <div>
          <label>Updated By</label>
          <span>{purchase.updatedBy?.name || "—"} - {purchase.updatedBy?.role || "—"}</span>
        </div>
      </div>
      
      <div className="table-responsive">
      <table className="pfl-purview__items">
        <thead>
          <tr>
            <th>Product</th>
            <th>Batch No</th>
            {/* <th>Expiry</th> */}
            <th className="pfl-purview__col-right">Purchase Price</th>
            <th className="pfl-purview__col-center">Qty</th>
            <th className="pfl-purview__col-right">Subtotal</th>
            <th className="pfl-purview__col-right">Return Qty</th>
            <th className="pfl-purview__col-right">Return Amount</th>
          </tr>
        </thead>
        <tbody>
          {(purchase.items || []).map((it, idx) => (
            <tr key={idx}>
              <td>{it.product?.name || "—"}</td>
              <td className="pfl-purview__batchno">{it.batchNo}</td>
              {/* <td>{it.expiryDate ? new Date(it.expiryDate).toLocaleDateString() : "—"}</td> */}
              <td className="pfl-purview__col-right">PKR {Number(it.purchasePrice || 0).toLocaleString()}</td>
              <td className="pfl-purview__col-center">{it.quantity}</td>
              <td className="pfl-purview__col-right pfl-purview__amount-cell">
                PKR {(Number(it.quantity || 0) * Number(it.purchasePrice || 0)).toLocaleString()}
              </td>
              <td className="pfl-purview__col-right">{it.returnQuantity || "-"}</td>
              <td className="pfl-purview__col-right">{(it.returnAmount || "-")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <div className="pfl-purview__totals">
        <div>
          <span>Total Amount (Orignal)</span>
          <strong>PKR {Number(purchase.totalAmount || 0).toLocaleString()}</strong>
        </div>
        {Number(purchase.totalReturnAmount || 0) > 0 && (
        <div>
        <span>Total Return Amount</span>
          <strong>PKR {Number(purchase.totalReturnAmount || 0).toLocaleString()}</strong>
        </div>
        )}
        {Number(purchase.netAmount || 0) > 0 && (
        <div>
        <span>Net Amount</span>
          <strong>PKR {Number(purchase.netAmount || 0).toLocaleString()}</strong>
        </div>
        )}
        <div>
          <span>Paid</span>
          <strong>PKR {Number(purchase.paidAmount || 0).toLocaleString()}</strong>
        </div>
        <div className="pfl-purview__balance">
          <span>Remaining</span>
          <strong>PKR {Number(purchase.remainingAmount || 0).toLocaleString()}</strong>
        </div>
        {Number(purchase.cashRefundAmount || 0) > 0 && (
        <div>
          <span>Cash Refund</span>
          <strong>PKR {Number(purchase.cashRefundAmount || 0).toLocaleString()}</strong>
        </div>
        )}
          {Number(purchase.creditNoteAmount || 0) > 0 && (
          <div>
          <span>Credit Note Issued</span>
          <strong>PKR {Number(purchase.creditNoteAmount || 0).toLocaleString()}</strong>
        </div>
        )}

      </div>

      {purchase.payment?.length > 0 && (
        <div className="table-responsive">
        <div className="pfl-purview__history">
          <h5>Payment History</h5>
          <table className="pfl-purview__history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Notes</th>
                <th className="pfl-purview__col-right">Amount</th>
                <th>CreatedBy</th>
              </tr>
            </thead>
            <tbody>
              {purchase.payment.map((p, idx) => (
                <tr key={idx}>
                  <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : "—"}</td>
                  <td>{p.paymentMethod || "—"}</td>
                  <td>{p.refrence || "—"}</td>
                  <td>{p.notes || "—"}</td>
                  <td className="pfl-purview__col-right pfl-purview__amount-cell">
                    PKR {Number(p.amount || 0).toLocaleString()}
                  </td>
                  <td>{p.createdBy?.name || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
      )}

      <div className="pfl-purview__meta">
        <div>
          <label>Created At</label>
          <span>{fmtDate(purchase.createdAt || "—")}</span>
        </div>
        <div>
          <label>Updated At</label>
          <span>{fmtDate(purchase.updatedAt || "—")}</span>
        </div>
      </div>

      <div className="pfl-purview__actions">
        <button className="pfl-purform__btn pfl-purform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-purform__btn pfl-saleform__btn--primary" onClick={() => onReturn?.(purchase)}>
        Process Return
        </button>
        {/* <button className="pfl-purform__btn pfl-purform__btn--primary" onClick={() => onAddPayment?.(purchase)}>
          + Add Payment
        </button> */}
      </div>
    </div>
  );
}