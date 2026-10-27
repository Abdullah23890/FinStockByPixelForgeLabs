import { useState, useEffect } from "react";
import "../Css/SettingForm.css";

export default function SettingForm({ initialData = null, onSubmit, submitting = false, serverError = "", successMessage = "" }) {
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    printfooterText: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        address: initialData.address || "",
        phone: initialData.phone || "",
        printfooterText: initialData.printfooterText || "",
      });
      setLogoPreview(initialData.logo || "");
    }
  }, [initialData]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function handleLogoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Business name is required";

    if (form.phone && !/^923[0-9]{9}$/.test(form.phone)) {
      next.phone = "Enter a valid Pakistani mobile number (e.g. 923001234567)";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit?.({
      name: form.name,
      address: form.address,
      phone: form.phone,
      printfooterText: form.printfooterText,
      logoFile, // null if unchanged
    });
  }

  return (
    <form className="pfl-setform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-setform__server-error">{serverError}</div>}
      {successMessage && <div className="pfl-setform__success">{successMessage}</div>}

      <div className="pfl-setform__logo-row">
        <div className="pfl-setform__logo-preview img-fluid">
          {logoPreview ? (
            <img src={logoPreview} alt="Business logo" />
          ) : (
            <span>No logo</span>
          )}
        </div>
        <label className="pfl-setform__logo-upload">
          Change logo
          <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
        </label>
      </div>

      <div className="pfl-setform__grid">
        <div className="pfl-setform__field pfl-setform__field--full">
          <label>Business name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className={errors.name ? "is-invalid" : ""}
            placeholder="e.g. Sana Cosmetics"
          />
          {errors.name && <span className="pfl-setform__error">{errors.name}</span>}
        </div>

        <div className="pfl-setform__field">
          <label>Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            className={errors.phone ? "is-invalid" : ""}
            placeholder="923001234567"
          />
          {errors.phone && <span className="pfl-setform__error">{errors.phone}</span>}
        </div>

        <div className="pfl-setform__field pfl-setform__field--full">
          <label>Address</label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Shop address"
          />
        </div>

        <div className="pfl-setform__field pfl-setform__field--full">
          <label>Receipt/Invoice foote r text</label>
          <textarea
            name="printfooterText"
            rows={2}
            value={form.printfooterText}
            onChange={handleChange}
            placeholder="e.g. Thank you for shopping with us!"
          />
        </div>
      </div>

      <div className="pfl-setform__actions">
        <button type="submit" className="pfl-setform__btn pfl-setform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}