import "../Css/CategoryProfile.css";

export default function CategoryProfile({ category, onEdit, onClose }) {
  if (!category) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-catprofile">
      <div className="pfl-catprofile__head">
        <h4>{category.name}</h4>
      </div>

      <div className="pfl-catprofile__grid">
        <div className="pfl-catprofile__item pfl-catprofile__item--full">
          <label>Created By</label>
          <span>{category.createdBy?.name || "—"} - {category.createdBy?.role}</span>
        </div>
        <div className="pfl-catprofile__item pfl-catprofile__item--full">
          <label>Last Updated By</label>
          <span>{category.updatedBy?.name || "—"} - {category.updatedBy?.role}</span>
        </div>
        <div className="pfl-catprofile__item">
          <label>Created At</label>
          <span>{fmtDate(category.createdAt)}</span>
        </div>
        <div className="pfl-catprofile__item">
          <label>Last Updated At</label>
          <span>{fmtDate(category.updatedAt)}</span>
        </div>
      </div>

      <div className="pfl-catprofile__actions">
        <button className="pfl-catform__btn pfl-catform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-catform__btn pfl-catform__btn--primary" onClick={() => onEdit?.(category)}>
          Edit Category
        </button>
      </div>
    </div>
  );
}