import "../Css/CustomerProfile.css";

const TYPE_LABELS = {
  retail: "Retail",
  wholeSale: "Wholesale",
  // parlor: "Parlor",
};

export default function CustomerProfile({ customer, onEdit, onClose }) {
  if (!customer) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-custprofile">
      <div className="pfl-custprofile__head">
        <span className="pfl-custprofile__avatar">
          {(customer.name || "C").charAt(0).toUpperCase()}
        </span>
        <div>
          <h4>{customer.name}</h4>
          <span className={`pfl-custprofile__type pfl-custprofile__type--${customer.type}`}>
            {TYPE_LABELS[customer.type] || customer.type}
          </span>
        </div>
      </div>

      <div className="pfl-custprofile__grid">
        <div className="pfl-custprofile__item">
          <label>Contact Number</label>
          <span>{customer.contactNo || "—"}</span>
        </div>
        {/* <div className="pfl-custprofile__item">
          <label>Credit Limit</label>
          <span>{customer.creditLimit != null ? `PKR ${Number(customer.creditLimit).toLocaleString()}` : "—"}</span>
        </div> */}
        <div className="pfl-custprofile__item pfl-custprofile__item--full">
          <label>Address</label>
          <span>{customer.address || "—"}</span>
        </div>
        <div className="pfl-custprofile__item pfl-custprofile__item--full">
          <label>Created By</label>
          <span>{customer.createdBy?.name || "—"} - {customer.createdBy?.role || "—"}</span>
        </div>
        <div className="pfl-custprofile__item pfl-custprofile__item--full">
          <label>Last Updated By</label>
          <span>{customer.updatedBy?.name || "—"} - {customer.updatedBy?.role || "—"}</span>
        </div>
        <div className="pfl-custprofile__item">
          <label>Created At</label>
          <span>{fmtDate(customer.createdAt)}</span>
        </div>
        <div className="pfl-custprofile__item">
          <label>Last Updated At</label>
          <span>{fmtDate(customer.updatedAt)}</span>
        </div>
      </div>

      <div className="pfl-custprofile__actions">
        <button className="pfl-custform__btn pfl-custform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-custform__btn pfl-custform__btn--primary" onClick={() => onEdit?.(customer)}>
          Edit Customer
        </button>
      </div>
    </div>
  );
}