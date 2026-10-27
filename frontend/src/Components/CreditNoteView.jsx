import "../Css/CreditNoteView.css";

export default function CreditNoteView({ creditNote, onClose }) {
  if (!creditNote) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  const statusTone = creditNote.status === "used" ? "used" : creditNote.status === "expired" ? "expired" : "active";

  return (
    <div className="pfl-cnview">
      <div className="pfl-cnview__head">
        <div>
          <h4>{creditNote.creditNoteNumber}</h4>
          <span className="pfl-cnview__sub">Against {creditNote.sale?.saleNumber || "—"}</span>
        </div>
        <span className={`pfl-cnview__status pfl-cnview__status--${statusTone}`}>{creditNote.status}</span>
      </div>

      <div className="pfl-cnview__amounts">
        <div>
          <label>Amount</label>
          <span>PKR {Number(creditNote.amount || 0).toLocaleString()}</span>
        </div>
        <div>
          <label>Used</label>
          <span>PKR {Number(creditNote.usedAmount || 0).toLocaleString()}</span>
        </div>
        <div className="pfl-cnview__remaining">
          <label>Remaining</label>
          <span>PKR {Number(creditNote.remainingAmount || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="pfl-cnview__progress-bar">
        <div
          className="pfl-cnview__progress-fill"
          style={{
            width: `${creditNote.amount ? Math.min((creditNote.usedAmount / creditNote.amount) * 100, 100) : 0}%`,
          }}
        />
      </div>

      <div className="pfl-cnview__meta">
        <div>
          <label>Issued On</label>
          <span>{fmtDate(creditNote.createdAt)}</span>
        </div>
        {/* <div>
          <label>Created By</label>
          <span>{creditNote.createdBy?.name || "—"}</span>
        </div> */}
      </div>

      <div className="pfl-cnview__actions">
        <button className="pfl-return__btn pfl-return__btn--ghost" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}