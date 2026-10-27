import { useState, useEffect } from "react";
import "../Css/SupplierForm.css";

export default function SupplierForm({ initialData = null, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    contactNo: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        contactNo: initialData.contactNo || "",
        address: initialData.address || "",
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

    if (!form.name.trim()) next.name = "Supplier name is required";

    if (form.contactNo && !/^923[0-9]{9}$/.test(form.contactNo)) {
      next.contactNo = "Enter a valid Pakistani mobile number (e.g. 923001234567)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(form);
  }

  return (
    <form className="pfl-supform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-supform__server-error">{serverError}</div>}

      <div className="pfl-supform__grid">
        <div className="pfl-supform__field">
          <label>Supplier name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "is-invalid" : ""}
            placeholder="e.g. Al-Noor Cosmetics Distributors"
          />
          {errors.name && <span className="pfl-supform__error">{errors.name}</span>}
        </div>

        <div className="pfl-supform__field">
          <label>Contact number</label>
          <input
            name="contactNo"
            value={form.contactNo}
            onChange={handleChange}
            className={errors.contactNo ? "is-invalid" : ""}
            placeholder="923001234567"
          />
          {errors.contactNo && <span className="pfl-supform__error">{errors.contactNo}</span>}
        </div>

        <div className="pfl-supform__field pfl-supform__field--full">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, city, country"
          />
        </div>
      </div>

      <div className="pfl-supform__actions">
        <button type="button" className="pfl-supform__btn pfl-supform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-supform__btn pfl-supform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Supplier"}
        </button>
      </div>
    </form>
  );
}