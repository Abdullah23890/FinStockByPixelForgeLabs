import "../Css/ExpenseView.css";

const CATEGORY_LABELS = {
  electricity: "Electricity",
  salary: "Salary",
  wifi: "WiFi",
  software: "Software",
  dailyBasic: "Daily Basic",
  bonus: "Bonus",
  rent: "Rent",
  shopMaintaince: "Shop Maintenance",
};

export default function ExpenseView({ expense, onEdit, onClose }) {
  if (!expense) return null;

  function fmtDate(d) {
    return d ? new Date(d).toLocaleString() : "—";
  }

  return (
    <div className="pfl-expview">
      <div className="pfl-expview__head">
        <h4>{expense.name}</h4>
        <span className="pfl-expview__category">{CATEGORY_LABELS[expense.category] || expense.category}</span>
      </div>

      <div className="pfl-expview__amount">PKR {Number(expense.amount || 0).toLocaleString()}</div>

      <div className="pfl-expview__grid">
        <div className="pfl-expview__item">
          <label>Date</label>
          <span>{expense.date ? new Date(expense.date).toLocaleDateString() : "—"}</span>
        </div>
        <div className="pfl-expview__item pfl-expview__item--full">
          <label>Created By</label>
          <span>{expense.createdBy?.name || "—"} - {expense.createdBy?.role || "—"}</span>
        </div>
        <div className="pfl-expview__item pfl-expview__item--full">
          <label>Last Updated By</label>
          <span>{expense.updatedBy?.name || "—"} - {expense.updatedBy?.role || "—"}</span>
        </div>
        <div className="pfl-expview__item">
          <label>Created At</label>
          <span>{fmtDate(expense.createdAt)}</span>
        </div>
        <div className="pfl-expview__item">
          <label>Last Updated At</label>
          <span>{fmtDate(expense.updatedAt)}</span>
        </div>
      </div>

      <div className="pfl-expview__actions">
        <button className="pfl-expform__btn pfl-expform__btn--ghost" onClick={onClose}>
          Close
        </button>
        <button className="pfl-expform__btn pfl-expform__btn--primary" onClick={() => onEdit?.(expense)}>
          Edit Expense
        </button>
      </div>
    </div>
  );
}