import { useState, useEffect } from "react";
import "../Css/CustomerForm.css";

const TYPES = [
  { value: "retail", label: "Retail" },
  { value: "wholeSale", label: "Wholesale" },
  // { value: "parlor", label: "Parlor" },
];

export default function CustomerForm({ initialData = null, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    type: "retail",
    contactNo: "",
    address: "",
    creditLimit: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        type: initialData.type || "retail",
        contactNo: initialData.contactNo || "",
        address: initialData.address || "",
        // creditLimit: initialData.creditLimit ?? "",
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

    if (!form.name.trim()) next.name = "Customer name is required";

    if (form.contactNo && !/^923[0-9]{9}$/.test(form.contactNo)) {
      next.contactNo = "Enter a valid Pakistani mobile number (e.g. 923001234567)";
    }

    // if (form.creditLimit && Number(form.creditLimit) < 0) {
    //   next.creditLimit = "Credit limit can't be negative";
    // }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      name: form.name,
      type: form.type,
      contactNo: form.contactNo,
      address: form.address,
      // creditLimit: form.creditLimit === "" ? undefined : Number(form.creditLimit),
    });
  }

  return (
    <form className="pfl-custform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-custform__server-error">{serverError}</div>}

      <div className="pfl-custform__grid">
        <div className="pfl-custform__field">
          <label>Customer name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "is-invalid" : ""}
            placeholder="e.g. Sana Beauty Parlor"
          />
          {errors.name && <span className="pfl-custform__error">{errors.name}</span>}
        </div>

        <div className="pfl-custform__field">
          <label>Type</label>
          <select name="type" value={form.type} onChange={handleChange}>
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pfl-custform__field">
          <label>Contact number</label>
          <input
            name="contactNo"
            value={form.contactNo}
            onChange={handleChange}
            className={errors.contactNo ? "is-invalid" : ""}
            placeholder="923001234567"
          />
          {errors.contactNo && <span className="pfl-custform__error">{errors.contactNo}</span>}
        </div>

        {/* <div className="pfl-custform__field">
          <label>Credit limit (PKR)</label>
          <input
            name="creditLimit"
            type="number"
            min="0"
            value={form.creditLimit}
            onChange={handleChange}
            className={errors.creditLimit ? "is-invalid" : ""}
            placeholder="e.g. 50000 (optional)"
          />
          {errors.creditLimit && <span className="pfl-custform__error">{errors.creditLimit}</span>}
        </div> */}

        <div className="pfl-custform__field pfl-custform__field--full">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Street, city, country"
          />
        </div>
      </div>

      <div className="pfl-custform__actions">
        <button type="button" className="pfl-custform__btn pfl-custform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-custform__btn pfl-custform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Customer"}
        </button>
      </div>
    </form>
  );
}