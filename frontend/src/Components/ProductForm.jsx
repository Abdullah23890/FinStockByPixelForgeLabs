import { useState, useEffect } from "react";
import "../Css/ProductForm.css";

export default function ProductForm({
  initialData = null,
  categories = [],
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
}) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    category: "",
    barcode: "",
    retailPrice: "",
    wholesalePrice: "",
    parlorPrice: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        category: initialData.category?._id || initialData.category || "",
        barcode: initialData.barcode || "",
        retailPrice: initialData.retailPrice ?? "",
        wholesalePrice: initialData.wholesalePrice ?? "",
        parlorPrice: initialData.parlorPrice ?? "",
        status: initialData.status || "active",
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

    if (!form.name.trim()) next.name = "Product name is required";
    if (!form.category) next.category = "Please select a category";

    if (!form.barcode.trim()) {
      next.barcode = "Barcode is required";
    }

    if (!form.retailPrice || Number(form.retailPrice) < 0) {
      next.retailPrice = "Enter a valid retail price";
    }
    if (!form.wholesalePrice || Number(form.wholesalePrice) < 0) {
      next.wholesalePrice = "Enter a valid wholesale price";
    }
    // if (!form.parlorPrice || Number(form.parlorPrice) < 0) {
    //   next.parlorPrice = "Enter a valid parlor price";
    // }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      name: form.name,
      category: form.category,
      barcode: form.barcode,
      retailPrice: Number(form.retailPrice),
      wholesalePrice: Number(form.wholesalePrice),
      // parlorPrice: Number(form.parlorPrice),
      status: form.status,
    });
  }

  return (
    <form className="pfl-prform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-prform__server-error">{serverError}</div>}

      <div className="pfl-prform__grid">
        <div className="pfl-prform__field pfl-prform__field--full">
          <label>Product name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "is-invalid" : ""}
            placeholder="e.g. Boss Chairs"
          />
          {errors.name && <span className="pfl-prform__error">{errors.name}</span>}
        </div>

        <div className="pfl-prform__field">
          <label>Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className={errors.category ? "is-invalid" : ""}
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category && <span className="pfl-prform__error">{errors.category}</span>}
        </div>

        <div className="pfl-prform__field">
          <label>Barcode</label>
          <input
            name="barcode"
            value={form.barcode}
            onChange={handleChange}
            className={errors.barcode ? "is-invalid" : ""}
            placeholder="Scan or enter barcode"
          />
          {errors.barcode && <span className="pfl-prform__error">{errors.barcode}</span>}
        </div>

        <div className="pfl-prform__field">
          <label>Retail Price (PKR)</label>
          <input
            name="retailPrice"
            type="number"
            min="0"
            value={form.retailPrice}
            onChange={handleChange}
            className={errors.retailPrice ? "is-invalid" : ""}
            placeholder="e.g. 1200"
          />
          {errors.retailPrice && <span className="pfl-prform__error">{errors.retailPrice}</span>}
        </div>

        <div className="pfl-prform__field">
          <label>Wholesale Price (PKR)</label>
          <input
            name="wholesalePrice"
            type="number"
            min="0"
            value={form.wholesalePrice}
            onChange={handleChange}
            className={errors.wholesalePrice ? "is-invalid" : ""}
            placeholder="e.g. 950"
          />
          {errors.wholesalePrice && <span className="pfl-prform__error">{errors.wholesalePrice}</span>}
        </div>

        {/* <div className="pfl-prform__field">
          <label>Parlor Price (PKR)</label>
          <input
            name="parlorPrice"
            type="number"
            min="0"
            value={form.parlorPrice}
            onChange={handleChange}
            className={errors.parlorPrice ? "is-invalid" : ""}
            placeholder="e.g. 1000"
          />
          {errors.parlorPrice && <span className="pfl-prform__error">{errors.parlorPrice}</span>}
        </div> */}

        <div className="pfl-prform__field">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inActive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="pfl-prform__actions">
        <button type="button" className="pfl-prform__btn pfl-prform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-prform__btn pfl-prform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Product"}
        </button>
      </div>
    </form>
  );
}