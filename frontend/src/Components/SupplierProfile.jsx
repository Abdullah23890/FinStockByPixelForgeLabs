import "../Css/SupplierProfile.css";

export default function SupplierProfile({ supplier, onEdit, onClose }) {
  if (!supplier) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-supprofile">
      <div className="pfl-supprofile__head">
        <h4>{supplier.name}</h4>
      </div>

      <div className="pfl-supprofile__grid">
        <div className="pfl-supprofile__item">
          <label>Contact Number</label>
          <span>{supplier.contactNo || "—"}</span>
        </div>
        <div className="pfl-supprofile__item pfl-supprofile__item--full">
          <label>Address</label>
          <span>{supplier.address || "—"}</span>
        </div>
        <div className="pfl-supprofile__item pfl-supprofile__item--full">
          <label>Created By</label>
          <span>{supplier.createdBy?.name || "—"} - {supplier.createdBy?.role || "—"}</span>
        </div>
        <div className="pfl-supprofile__item pfl-supprofile__item--full">
          <label>Last Updated By</label>
          <span>{supplier.updatedBy?.name || "—"} - {supplier.updatedBy?.role || "—"}</span>
        </div>
        <div className="pfl-supprofile__item">
          <label>Created At</label>
          <span>{fmtDate(supplier.createdAt)}</span>
        </div>
        <div className="pfl-supprofile__item">
          <label>Last Updated At</label>
          <span>{fmtDate(supplier.updatedAt)}</span>
        </div>
      </div>

      <div className="pfl-supprofile__actions">
        <button className="pfl-supform__btn pfl-supform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-supform__btn pfl-supform__btn--primary" onClick={() => onEdit?.(supplier)}>
          Edit Supplier
        </button>
      </div>
    </div>
  );
}