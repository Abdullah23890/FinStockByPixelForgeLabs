import "../Css/UserProfile.css";

const ROLE_LABELS = {
  admin: "Admin",
  saleManager: "Sale Manager",
  counter: "Counter"
};

export default function UserProfile({ user, onEdit, onClose }) {
  if (!user) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-uprofile">
      <div className="pfl-uprofile__head">
        <span className="pfl-uprofile__avatar">
          {(user.name || "U").charAt(0).toUpperCase()}
        </span>
        <div>
          <h4>{user.name}</h4>
          <span className={`pfl-uprofile__role pfl-uprofile__role--${user.role}`}>
            {ROLE_LABELS[user.role] || user.role}
          </span>
        </div>
      </div>

      <div className="pfl-uprofile__grid">
        <div className="pfl-uprofile__item">
          <label>Username</label>
          <span>{user.userName || "—"}</span>
        </div>
        <div className="pfl-uprofile__item">
          <label>Phone</label>
          <span>{user.phone || "—"}</span>
        </div>
        <div className="pfl-uprofile__item">
          <label>Status</label>
          <span className={`pfl-uprofile__status pfl-uprofile__status--${user.status}`}>
            {user.status === "active" ? "Active" : "Resigned"}
          </span>
        </div>
        <div className="pfl-uprofile__item">
          <label>Created</label>
          <span>{fmtDate(user.createdAt)}</span>
        </div>
        <div className="pfl-uprofile__item pfl-uprofile__item--full">
          <label>Created by</label>
          <span>{user.createdBy?.name || "—"} - {user.createdBy?.role || "-"}</span>
        </div>
        <div className="pfl-uprofile__item pfl-uprofile__item--full">
          <label>Last updated by</label>
          <span>{user.updatedBy?.name || "—"} - {user.updatedBy?.role || "-"}</span>
        </div>
        <div className="pfl-uprofile__item pfl-uprofile__item--full">
          <label>CreatedAt</label>
          <span>{fmtDate(user.createdAt || "-")}</span>
        </div>
        <div className="pfl-uprofile__item pfl-uprofile__item--full">
          <label>Last updatedAt</label>
          <span>{fmtDate(user.updatedAt || "-")}</span>
        </div>
      </div>

      <div className="pfl-uprofile__actions">
        <button className="pfl-uform__btn pfl-uform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-uform__btn pfl-uform__btn--primary" onClick={() => onEdit?.(user)}>
          Edit Profile
        </button>
      </div>
    </div>
  );
}