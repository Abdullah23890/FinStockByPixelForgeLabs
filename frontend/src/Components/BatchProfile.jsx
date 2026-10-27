import "../Css/BatchProfile.css";

function getExpiryStatus(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return { label: "Expired", tone: "expired" };
  if (daysLeft <= 30) return { label: `${daysLeft} days left`, tone: "nearExpiry" };
  return { label: `${daysLeft} days left`, tone: "ok" };
}

export default function BatchProfile({ batch, onEdit, onClose }) {
  if (!batch) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  const expiry = getExpiryStatus(batch.expiryDate);

  return (
    <div className="pfl-batprofile">
      <div className="pfl-batprofile__head">
        <div>
          <h4>{batch.product?.name || "—"}</h4>
          <span className="pfl-batprofile__batchno">{batch.batchNo}</span>
        </div>
        <span className={`pfl-batprofile__expiry pfl-batprofile__expiry--${expiry.tone}`}>
          {expiry.label}
        </span>
      </div>

      <div className="pfl-batprofile__grid">
        <div className="pfl-batprofile__item">
          <label>Purchase No</label>
          <span>{batch.purchaseId?.purchaseNumber || "-"}</span>
        </div>
        <div className="pfl-batprofile__item">
          <label>Quantity</label>
          <span>{batch.quantity}</span>
        </div>
        <div className="pfl-batprofile__item">
          <label>Purchase Price</label>
          <span>PKR {Number(batch.purchasePrice || 0).toLocaleString()}</span>
        </div>
        <div className="pfl-batprofile__item pfl-batprofile__item--full">
          <label>Expiry Date</label>
          <span>{fmtDate(batch.expiryDate)}</span>
        </div>
        <div className="pfl-batprofile__item pfl-batprofile__item--full">
          <label>Created By</label>
          <span>{batch.createdBy?.name || "—"} - {batch.createdBy?.role || "—"}</span>
        </div>
        <div className="pfl-batprofile__item">
          <label>Created At</label>
          <span>{fmtDate(batch.createdAt)}</span>
        </div>
      </div>

      <div className="pfl-batprofile__actions">
        <button className="pfl-batform__btn pfl-batform__btn--ghost" onClick={onClose}>
          Close
        </button>
        {/*<button className="pfl-batform__btn pfl-batform__btn--primary" onClick={() => onEdit?.(batch)}>
          Edit Batch
        </button>*/}
      </div>
    </div>
  );
}