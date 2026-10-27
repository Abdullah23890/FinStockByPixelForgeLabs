import "../Css/SaleView.css";

function fmtDate(d) {
  return d ? new Date(d).toLocaleString() : "—";
}

const CHANNEL_LABELS = { retail: "Retail", wholeSale: "Wholesale" };
const STATUS_LABELS = { paid: "Paid", partial: "Partial", unPaid: "Unpaid" };

export default function SaleView({ sale, onClose, onAddPayment, onReturn, onPrint }) {
  if (!sale) return null;

  return (
    <div className="pfl-saleview">
      <div className="pfl-saleview__head">
        <div>
          <h4>{sale.saleNumber}</h4>
          <span className="pfl-saleview__customer">{sale.customer?.name || "Walk-in Customer"}</span>
        </div>
        <div className="pfl-saleview__badges">
          <span className={`pfl-saleview__channel pfl-saleview__channel--${sale.channel}`}>
            {CHANNEL_LABELS[sale.channel] || sale.channel}
          </span>
          <span className={`pfl-saleview__status pfl-saleview__status--${sale.status}`}>
            {STATUS_LABELS[sale.status] || sale.status}
          </span>
        </div>
      </div>

    <div className="table-responsive">
      <table className="pfl-saleview__items">
        <thead>
          <tr>
            <th>Product</th>
            <th>B.No</th>
            <th className="pfl-saleview__col-center">Qty</th>
            <th className="pfl-saleview__col-right">Price</th>
            <th className="pfl-saleview__col-right">Discount</th>
            <th className="pfl-saleview__col-right">Total</th>
            <th className="pfl-saleview__col-center">Returned</th>
            <th className="pfl-saleview__col-right">Return Amt</th>
          </tr>
        </thead>
        <tbody>
          {(sale.items || []).map((it, idx) => (
            <tr key={idx}>
              <td>{it.product?.name || "—"}</td>
              <td>{it.batch?.batchNo || "—"}</td>
              <td className="pfl-saleview__col-center">{it.quantity}</td>
              <td className="pfl-saleview__col-right">PKR {Number(it.unitPrice || 0).toLocaleString()}</td>
              <td className="pfl-saleview__col-right">PKR {Number(it.discount || 0).toLocaleString()}</td>
              <td className="pfl-saleview__col-right pfl-saleview__amount-cell">
                PKR {Number(it.total || 0).toLocaleString()}
              </td>
              <td className="pfl-saleview__col-center">
                {Number(it.returnQuantity || 0) > 0 ? (
                  <span className="pfl-saleview__return-badge">{it.returnQuantity}</span>
                ) : (
                  "—"
                )}
              </td>
              <td className="pfl-saleview__col-right">
                {Number(it.returnAmount || 0) > 0
                  ? `PKR ${Number(it.returnAmount).toLocaleString()}`
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      {sale.payment?.length > 0 && (
        <div className="pfl-purview__history">
          <h5>Payment History</h5>
          <div className="table-responsive">
          <table className="pfl-purview__history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Notes</th>
                <th className="pfl-purview__col-right">Amount</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {sale.payment.map((p, idx) => (
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

      <div className="pfl-saleview__totals">
        <div>
          <span>Subtotal</span>
          <strong>PKR {Number(sale.subTotal || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>Discount</span>
          <strong>PKR {Number(sale.discount || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>Tax</span>
          <strong>PKR {Number(sale.tax || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span>Total (original)</span>
          <strong>PKR {Number(sale.totalAmount || 0).toLocaleString()}</strong>
        </div>
        {Number(sale.totalReturnAmount || 0) > 0 && (
          <div className="pfl-saleview__return-row">
            <span>Total Returned</span>
            <strong>- PKR {Number(sale.totalReturnAmount).toLocaleString()}</strong>
          </div>
        )}
        {Number(sale.totalReturnAmount || 0) > 0 && (
          <div>
            <span>Net Amount</span>
            <strong>PKR {Number(sale.netAmount ?? sale.totalAmount).toLocaleString()}</strong>
          </div>
        )}
        <div>
          <span>Paid</span>
          <strong>PKR {Number(sale.paidAmount || 0).toLocaleString()}</strong>
        </div>
        {Number(sale.cashRefundAmount || 0) > 0 && (
          <div>
            <span>Cash Refunded</span>
            <strong>PKR {Number(sale.cashRefundAmount).toLocaleString()}</strong>
          </div>
        )}
        {Number(sale.creditNoteAmount || 0) > 0 && (
          <div>
            <span>Credit Note Issued</span>
            <strong>PKR {Number(sale.creditNoteAmount).toLocaleString()}</strong>
          </div>
        )}
        <div className="pfl-saleview__due">
          <span>Due</span>
          <strong>PKR {Number(sale.dueAmount || 0).toLocaleString()}</strong>
        </div>
      </div>

      <div className="pfl-purview__meta">
        <label>Created By</label>
        <span>{sale.createdBy?.name || "—"} - {sale.createdBy?.role || "—"}</span>
        <label>Created At</label>
        <span>{fmtDate(sale.createdAt)}</span>
        <label>Updated At</label>
        <span>{fmtDate(sale.updatedAt)}</span>
      </div>

      <div className="pfl-saleview__actions">
        <button className="pfl-saleform__btn pfl-saleform__btn--ghost" onClick={onClose}>
          Close
        </button>
        {/* {sale.dueAmount > 0 && onAddPayment && (
          <button className="pfl-saleform__btn pfl-saleform__btn--primary" onClick={() => onAddPayment(sale)}>
            + Add Payment
          </button>
        )} */}
        <button className="pfl-saleform__btn pfl-saleform__btn--primary" onClick={() => onReturn(sale)}>
          Process Return
        </button>
        <button className="pfl-saleform__btn pfl-saleform__btn--primary" onClick={() => onPrint?.(sale)}>
        Print ({sale.printSize === "thermal" ? "Thermal" : "A4"})
        </button>
      </div>
    </div>
  );
}