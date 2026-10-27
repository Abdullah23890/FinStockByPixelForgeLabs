import { useState, useEffect } from "react";
import "../Css/UserForm.css";

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "saleManager", label: "Sale Manager" },
  { value: "counter", label: "Counter" },
];

export default function UserForm({ initialData = null, onSubmit, onCancel, submitting = false, serverError = "" }) {
  const isEditMode = Boolean(initialData);

  const [form, setForm] = useState({
    name: "",
    userName: "",
    password: "",
    role: "retailCounter",
    phone: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        userName: initialData.userName || "",
        password: "", // never pre-fill password — leave blank = "don't change"
        role: initialData.role || "retailCounter",
        phone: initialData.phone || "",
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

    if (!form.name.trim()) next.name = "Name is required";

    if (!form.userName.trim()) {
      next.userName = "Username is required";
    } else if (!/^[a-zA-Z0-9_.]{3,20}$/.test(form.userName)) {
      next.userName = "Username must be 3-20 characters (letters, numbers, _ or .)";
    }

    if (!isEditMode && !form.password) {
      next.password = "Password is required";
    } else if (form.password && form.password.length < 6) {
      next.password = "Password must be at least 6 characters";
    }

    if (form.phone && !/^923[0-9]{9}$/.test(form.phone)) {
      next.phone = "Enter a valid Pakistani mobile number (e.g. 923001234567)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const payload = { ...form };
    if (isEditMode && !payload.password) delete payload.password; // don't send blank password on edit

    onSubmit?.(payload);
  }

  return (
    <form className="pfl-uform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-uform__server-error">{serverError}</div>}

      <div className="pfl-uform__grid">
        <div className="pfl-uform__field">
          <label>Full name</label>
          <input name="name" value={form.name} onChange={handleChange} className={errors.name ? "is-invalid" : ""} placeholder="e.g. Ayesha Khan" />
          {errors.name && <span className="pfl-uform__error">{errors.name}</span>}
        </div>

        <div className="pfl-uform__field">
          <label>Username</label>
          <input
            name="userName"
            value={form.userName}
            onChange={handleChange}
            className={errors.userName ? "is-invalid" : ""}
            placeholder="e.g. ayesha.khan"
            disabled={isEditMode} // username usually shouldn't change once created
          />
          {errors.userName && <span className="pfl-uform__error">{errors.userName}</span>}
        </div>

        <div className="pfl-uform__field">
          <label>{isEditMode ? "New password (optional)" : "Password"}</label>
          <div className="pfl-uform__password-wrap">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "is-invalid" : ""}
              placeholder={isEditMode ? "Leave blank to keep current password" : "Minimum 6 characters"}
            />
            <button
              type="button"
              className="pfl-uform__password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <span className="pfl-uform__error">{errors.password}</span>}
        </div>

        <div className="pfl-uform__field">
          <label>Role</label>
          <select name="role" value={form.role} onChange={handleChange}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pfl-uform__field">
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={errors.phone ? "is-invalid" : ""}
            placeholder="923001234567"
          />
          {errors.phone && <span className="pfl-uform__error">{errors.phone}</span>}
        </div>

        <div className="pfl-uform__field">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="resigned">Resigned</option>
          </select>
        </div>
      </div>

      <div className="pfl-uform__actions">
        <button type="button" className="pfl-uform__btn pfl-uform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-uform__btn pfl-uform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Add User"}
        </button>
      </div>
    </form>
  );
}