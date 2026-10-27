import { useState, useEffect } from "react";
import "../Css/AddSalePaymentForm.css";

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "jazzCash", label: "JazzCash" },
  { value: "easyPaisa", label: "EasyPaisa" },
];

export default function AddSalePaymentForm({ sale, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const [form, setForm] = useState({ amount: "", paymentMethod: "cash", refrence: "", notes: "" });
  const [error, setError] = useState("");

  useEffect(() => {
      if (sale) {
        setForm({
          amount: "",
          paymentMethod: "cash",
          refrence: "",
          notes: "",
        });
  
        setError("");
      }
    }, [sale]);

  if (!sale) return null;

  const remaining = Number(sale.dueAmount || 0);

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
      setError(`Amount can't exceed the due balance (PKR ${remaining.toLocaleString()})`);
      return;
    }

    onSubmit?.(sale._id, {
      amount,
      paymentMethod: form.paymentMethod,
      refrence: form.refrence,
      notes: form.notes,
    });
  }

  return (
    <form className="pfl-salepay" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-salepay__server-error">{serverError}</div>}

      <div className="pfl-salepay__summary">
        <div>
          <label>Total</label>
          <span>PKR {Number(sale.totalAmount || 0).toLocaleString()}</span>
        </div>
        {Number(sale.totalReturnAmount || 0) > 0 && (
          <div>
            <label>Net Amount</label>
            <span>PKR {Number(sale.netAmount !== undefined ? sale.netAmount : (sale.totalAmount - sale.totalReturnAmount) || 0).toLocaleString()}</span>
          </div>
        )}
        <div>
          <label>Paid so far</label>
          <span>PKR {Number(sale.paidAmount || 0).toLocaleString()}</span>
        </div>
        <div className="pfl-salepay__summary-due">
          <label>Due</label>
          <span>PKR {remaining.toLocaleString()}</span>
        </div>
      </div>

      <div className="pfl-salepay__field">
        <label>Amount (PKR)</label>
        <input
          name="amount"
          type="number"
          min="0"
          value={form.amount}
          onChange={handleChange}
          className={error ? "is-invalid" : ""}
          placeholder="e.g. 1000"
        />
        {error && <span className="pfl-salepay__error">{error}</span>}
      </div>

      <div className="pfl-salepay__field">
        <label>Payment method</label>
        <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange}>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pfl-salepay__field">
        <label>Reference (optional)</label>
        <input name="refrence" value={form.refrence} onChange={handleChange} placeholder="e.g. transaction ID" />
      </div>

      <div className="pfl-salepay__field">
        <label>Notes (optional)</label>
        <input name="notes" value={form.notes} onChange={handleChange} placeholder="Any notes..." />
      </div>

      <div className="pfl-salepay__actions">
        <button type="button" className="pfl-saleform__btn pfl-saleform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-saleform__btn pfl-saleform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : "Add Payment"}
        </button>
      </div>
    </form>
  );
}