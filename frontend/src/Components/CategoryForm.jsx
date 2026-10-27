import { useState, useEffect } from "react";
import "../Css/CategoryForm.css";

export default function CategoryForm({ initialData = null, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({ name: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({ name: initialData.name || "" });
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Category name is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.({ name: form.name });
  }

  return (
    <form className="pfl-catform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-catform__server-error">{serverError}</div>}

      <div className="pfl-catform__field">
        <label>Category name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className={errors.name ? "is-invalid" : ""}
          placeholder="e.g. Skin Care"
        />
        {errors.name && <span className="pfl-catform__error">{errors.name}</span>}
      </div>

      <div className="pfl-catform__actions">
        <button type="button" className="pfl-catform__btn pfl-catform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-catform__btn pfl-catform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add Category"}
        </button>
      </div>
    </form>
  );
}