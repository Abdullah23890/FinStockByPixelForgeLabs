import { useEffect, useMemo, useState } from "react";
import "../Css/SaleReturnForm.css";

const REFUND_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "jazzCash", label: "JazzCash" },
  { value: "easyPaisa", label: "EasyPaisa" },
  { value: "creditNote", label: "Credit Note (supplier owes us)" },
];

export default function PurchaseReturnForm({
  purchase,
  purchaseReturns = [],
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
  loading = false,
}) {
  const [returnQty, setReturnQty] = useState({});
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!purchase) {
      setReturnQty({});
      return;
    }
    const initial = {};
    (purchase.items || []).forEach((item) => {
      initial[String(item.batchId)] = 0;
    });
    setReturnQty(initial);
    setReason("");
    setRefundMethod("cash");
    setError("");
  }, [purchase?._id]);

  if (!purchase) return null;

  function getRemainingQty(item) {
    const purchasedQty = Number(item.quantity || 0);
    const alreadyReturned = Number(item.returnQuantity || 0);
    return Math.max(purchasedQty - alreadyReturned, 0);
  }

  function handleQtyChange(batchId, value, maxQty) {
    const qty = Math.max(0, Math.min(Number(value) || 0, maxQty));
    setReturnQty((prev) => ({ ...prev, [batchId]: qty }));
    setError("");
  }

  const returnItems = (purchase.items || [])
    .map((item) => ({
      ...item,
      batchId: String(item.batchId),
      qty: Number(returnQty[String(item.batchId)] || 0),
    }))
    .filter((item) => item.qty > 0);

  const returnTotal = returnItems.reduce((sum, item) => sum + item.qty * Number(item.purchasePrice || 0), 0);

  function handleSubmit(e) {
    e.preventDefault();

    if (returnItems.length === 0) {
      setError("Select at least one item to return.");
      return;
    }

    onSubmit?.({
      purchaseId: purchase._id,
      items: returnItems.map((item) => ({
        batch: item.batchId,
        quantity: item.qty,
      })),
      reason,
      refundMethod,
    });
  }

  return (
    <form className="pfl-return" onSubmit={handleSubmit} noValidate>
      {loading && (
        <div className="pfl-return__loading">
          <span>Loading previous returns...</span>
        </div>
      )}

      {serverError && <div className="pfl-return__server-error">{serverError}</div>}
      {error && <div className="pfl-return__server-error">{error}</div>}

      <div className="pfl-return__info">
        <span>Purchase #{purchase.purchaseNumber}</span>
        <span>{purchase.supplier?.name || "—"}</span>
      </div>

      <div className="pfl-return__items">
        <div className="pfl-return__items-head">
          <span>Product</span>
          <span>Purchased</span>
          <span>Returned</span>
          <span>Return Qty</span>
          <span>Amount</span>
        </div>

        {(purchase.items || []).length === 0 ? (
          <div className="pfl-return__no-items">
            <p>No items in this purchase</p>
          </div>
        ) : (
          (purchase.items || []).map((item) => {
            const batchId = String(item.batchId);
            const qty = Number(returnQty[batchId] || 0);
            const alreadyReturned = Number(item.returnQuantity || 0);
            const remainingQty = getRemainingQty(item);
            const lineTotal = qty * Number(item.purchasePrice || 0);

            return (
              <div className="pfl-return__item-row" key={batchId}>
                <span className="pfl-return__product-name">{item.product?.name || "—"}</span>
                <span>{item.quantity}</span>
                <span>{alreadyReturned}</span>
                <input
                  type="number"
                  min="0"
                  max={remainingQty}
                  value={qty}
                  disabled={remainingQty === 0}
                  onChange={(e) => handleQtyChange(batchId, e.target.value, remainingQty)}
                />
                <span className="pfl-return__line-total">
                  PKR {lineTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="pfl-return__total">
        <span>Total Refund Amount</span>
        <strong>PKR {returnTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
      </div>

      <div className="pfl-return__field">
        <label>Refund method</label>
        <select value={refundMethod} onChange={(e) => setRefundMethod(e.target.value)}>
          {REFUND_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pfl-return__field">
        <label>Reason (optional)</label>
        <textarea
          rows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Damaged goods, wrong item received..."
        />
      </div>

      <div className="pfl-return__actions">
        <button type="button" className="pfl-return__btn pfl-return__btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button
          type="submit"
          className="pfl-return__btn pfl-return__btn--primary"
          disabled={submitting || returnItems.length === 0 || loading}
        >
          {submitting ? "Processing..." : "Process Return"}
        </button>
      </div>
    </form>
  );
}