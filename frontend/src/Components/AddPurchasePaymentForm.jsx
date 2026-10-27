import { useState, useEffect } from "react";
import "../Css/AddPurchasePaymentForm.css";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "jazzCash", label: "JazzCash" },
  { value: "easyPaisa", label: "EasyPaisa" },
];

export default function AddPurchasePaymentForm({ purchase, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const [form, setForm] = useState({
    amount: "",
    paymentMethod: "cash",
    refrence: "",
    notes: "",
  });

  const [error, setError] = useState("");

   useEffect(() => {
    if (purchase) {
      setForm({
        amount: "",
        paymentMethod: "cash",
        refrence: "",
        notes: "",
      });

      setError("");
    }
  }, [purchase]);

  if (!purchase) return null;

  const remaining = Number(purchase.remainingAmount || 0);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setError("Enter a valid payment amount");
      return;
    }

    if (amount > remaining) {
      setError(`Amount can't exceed the remaining balance (PKR ${remaining.toLocaleString()})`);
      return;
    }

    onSubmit?.(purchase._id, {
      amount,
      paymentMethod: form.paymentMethod,
      refrence: form.refrence,
      notes: form.notes,
    });
  }

  return (
    <form className="pfl-purpay" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-purpay__server-error">{serverError}</div>}

      <div className="pfl-purpay__summary">
        <div>
          <label>Total</label>
          <span>PKR {Number(purchase.totalAmount || 0).toLocaleString()}</span>
        </div>
        {Number(purchase.totalReturnAmount || 0) > 0 && (
          <div>
            <label>Net Amount</label>
            <span>PKR {Number(purchase.netAmount !== undefined ? purchase.netAmount : (purchase.totalAmount - purchase.totalReturnAmount) || 0).toLocaleString()}</span>
          </div>
        )}
        <div>
          <label>Paid so far</label>
          <span>PKR {Number(purchase.paidAmount || 0).toLocaleString()}</span>
        </div>
        <div className="pfl-purpay__summary-remaining">
          <label>Remaining</label>
          <span>PKR {remaining.toLocaleString()}</span>
        </div>
      </div>

      <div className="pfl-purpay__field">
        <label>Amount (PKR)</label>
        <input
          name="amount"
          type="number"
          min="0"
          value={form.amount}
          onChange={handleChange}
          className={error ? "is-invalid" : ""}
          placeholder="e.g. 15000"
        />
        {error && <span className="pfl-purpay__error">{error}</span>}
      </div>

      <div className="pfl-purpay__field">
        <label>Payment method</label>
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pfl-purpay__field">
        <label>Reference (optional)</label>
        <input name="refrence" value={form.refrence} onChange={handleChange} placeholder="e.g. transaction ID" />
      </div>

      <div className="pfl-purpay__field">
        <label>Notes (optional)</label>
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes about this payment..." />
      </div>

      <div className="pfl-purpay__actions">
        <button type="button" className="pfl-purform__btn pfl-purform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-purform__btn pfl-purform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : "Add Payment"}
        </button>
      </div>
    </form>
  );
}