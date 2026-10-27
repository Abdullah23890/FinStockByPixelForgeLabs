import { useState, useEffect } from "react";
import "../Css/ExpenseForm.css";

const CATEGORIES = [
  { value: "electricity", label: "Electricity" },
  { value: "salary", label: "Salary" },
  { value: "wifi", label: "WiFi" },
  { value: "software", label: "Software" },
  { value: "dailyBasic", label: "Daily Basic" },
  { value: "bonus", label: "Bonus" },
  { value: "rent", label: "Rent" },
  { value: "shopMaintaince", label: "Shop Maintenance" },
];

export default function ExpenseForm({ initialData = null, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    category: "electricity",
    date: new Date().toISOString().slice(0, 10),
    amount: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category || "electricity",
        date: initialData.date ? initialData.date.slice(0, 10) : "",
        amount: initialData.amount ?? "",
      });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const next = {};

    if (!form.name.trim()) next.name = "Expense name is required";
    if (!form.date) next.date = "Date is required";

    if (!form.amount || Number(form.amount) <= 0) {
      next.amount = "Enter a valid amount";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      name: form.name,
      category: form.category,
      date: form.date,
      amount: Number(form.amount),
    });
  }

  return (
    <form className="pfl-expform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-expform__server-error">{serverError}</div>}

      <div className="pfl-expform__grid">
        <div className="pfl-expform__field pfl-expform__field--full">
          <label>Expense name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "is-invalid" : ""}
            placeholder="e.g. K-Electric bill for June"
          />
          {errors.name && <span className="pfl-expform__error">{errors.name}</span>}
        </div>

        <div className="pfl-expform__field">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pfl-expform__field">
          <label>Date</label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className={errors.date ? "is-invalid" : ""}
          />
          {errors.date && <span className="pfl-expform__error">{errors.date}</span>}
        </div>

        <div className="pfl-expform__field pfl-expform__field--full">
          <label>Amount (PKR)</label>
          <input
            name="amount"
            type="number"
            min="0"
            value={form.amount}
            onChange={handleChange}
            className={errors.amount ? "is-invalid" : ""}
            placeholder="e.g. 5000"
          />
          {errors.amount && <span className="pfl-expform__error">{errors.amount}</span>}
        </div>
      </div>

      <div className="pfl-expform__actions">
        <button type="button" className="pfl-expform__btn pfl-expform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-expform__btn pfl-expform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Expense"}
        </button>
      </div>
    </form>
  );
}