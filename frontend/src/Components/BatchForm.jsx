import { useState, useEffect } from "react";
import "../Css/BatchForm.css";

export default function BatchForm({
  initialData = null,
  products = [],
  suppliers = [],
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
}) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({
    product: "",
    batchNo: "",
    expireDate: "",
    quantity: "",
    purchasePrice: "",
    supplier: "",
    receivedDate: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        product: initialData.product?._id || initialData.product || "",
        batchNo: initialData.batchNo || "",
        expireDate: initialData.expireDate ? initialData.expireDate.slice(0, 10) : "",
        quantity: initialData.quantity ?? "",
        purchasePrice: initialData.purchasePrice ?? "",
        supplier: initialData.supplier?._id || initialData.supplier || "",
        receivedDate: initialData.receivedDate ? initialData.receivedDate.slice(0, 10) : "",
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

    if (!form.product) next.product = "Please select a product";
    if (!form.batchNo.trim()) next.batchNo = "Batch number is required";
    if (!form.expireDate) next.expireDate = "Expiry date is required";

    if (!form.quantity || Number(form.quantity) <= 0) {
      next.quantity = "Enter a valid quantity";
    }

    if (!form.purchasePrice || Number(form.purchasePrice) < 0) {
      next.purchasePrice = "Enter a valid purchase price";
    }

    if (form.receivedDate && form.expireDate && form.expireDate < form.receivedDate) {
      next.expireDate = "Expiry date can't be before the received date";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      product: form.product,
      batchNo: form.batchNo,
      expireDate: form.expireDate,
      quantity: Number(form.quantity),
      purchasePrice: Number(form.purchasePrice),
      supplier: form.supplier || undefined,
      receivedDate: form.receivedDate || undefined,
    });
  }

  return (
    <form className="pfl-batform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-batform__server-error">{serverError}</div>}

      <div className="pfl-batform__grid">
        <div className="pfl-batform__field pfl-batform__field--full">
          <label>Product</label>
          <select
            name="product"
            value={form.product}
            onChange={handleChange}
            className={errors.product ? "is-invalid" : ""}
            disabled={isEditMode}
          >
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.barcode})
              </option>
            ))}
          </select>
          {errors.product && <span className="pfl-batform__error">{errors.product}</span>}
        </div>

        <div className="pfl-batform__field">
          <label>Batch number</label>
          <input
            name="batchNo"
            value={form.batchNo}
            onChange={handleChange}
            className={errors.batchNo ? "is-invalid" : ""}
            placeholder="e.g. BATCH-JAN-2026"
          />
          {errors.batchNo && <span className="pfl-batform__error">{errors.batchNo}</span>}
        </div>

        <div className="pfl-batform__field">
          <label>Supplier</label>
          <select name="supplier" value={form.supplier} onChange={handleChange}>
            <option value="">Select a supplier (optional)</option>
            {suppliers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pfl-batform__field">
          <label>Quantity</label>
          <input
            name="quantity"
            type="number"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            className={errors.quantity ? "is-invalid" : ""}
            placeholder="e.g. 100"
          />
          {errors.quantity && <span className="pfl-batform__error">{errors.quantity}</span>}
        </div>

        <div className="pfl-batform__field">
          <label>Purchase price (per unit)</label>
          <input
            name="purchasePrice"
            type="number"
            min="0"
            value={form.purchasePrice}
            onChange={handleChange}
            className={errors.purchasePrice ? "is-invalid" : ""}
            placeholder="e.g. 650"
          />
          {errors.purchasePrice && <span className="pfl-batform__error">{errors.purchasePrice}</span>}
        </div>

        <div className="pfl-batform__field">
          <label>Received date</label>
          <input name="receivedDate" type="date" value={form.receivedDate} onChange={handleChange} />
        </div>

        <div className="pfl-batform__field">
          <label>Expiry date</label>
          <input
            name="expireDate"
            type="date"
            value={form.expireDate}
            onChange={handleChange}
            className={errors.expireDate ? "is-invalid" : ""}
          />
          {errors.expireDate && <span className="pfl-batform__error">{errors.expireDate}</span>}
        </div>
      </div>

      <div className="pfl-batform__actions">
        <button type="button" className="pfl-batform__btn pfl-batform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-batform__btn pfl-batform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Batch"}
        </button>
      </div>
    </form>
  );
}