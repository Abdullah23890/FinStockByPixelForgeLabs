import { useMemo, useState } from "react";
import "../Css/ExpenseTable.css";
import { IconSearch, IconWallet } from "./Icons";

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

export default function ExpenseTable({ expenses = [], onEdit, onDelete, onView, onAddNew, loading = false }) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      const matchesSearch = !search.trim() || e.name?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === "all" || e.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, categoryFilter]);

  const totalAmount = filtered.reduce((sum, e) => sum + Number(e.amount || 0), 0);

  return (
    <div className="pfl-exptable">
      <div className="pfl-exptable__toolbar">
        <div className="pfl-exptable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by expense name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="pfl-exptable__select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        {onAddNew && (
          <button className="pfl-exptable__add-btn" onClick={onAddNew}>
            + Add Expense
          </button>
        )}
      </div>

      <div className="pfl-exptable__total-bar">
        <span>Total ({filtered.length} expenses)</span>
        <strong>PKR {totalAmount.toLocaleString()}</strong>
      </div>

      <div className="pfl-exptable__wrap">
        <table className="pfl-exptable__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Date</th>
              <th>Amount</th>
              <th className="pfl-exptable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="pfl-exptable__empty">Loading expenses...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="pfl-exptable__empty">
                  <IconWallet size={22} />
                  <span>No expenses match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((e) => (
                <tr key={e._id}>
                  <td className="pfl-exptable__name">{e.name}</td>
                  <td>
                    <span className={`pfl-exptable__category pfl-exptable__category--${e.category}`}>
                      {CATEGORY_LABELS[e.category] || e.category}
                    </span>
                  </td>
                  <td>{e.date ? new Date(e.date).toLocaleDateString() : "—"}</td>
                  <td>PKR {Number(e.amount || 0).toLocaleString()}</td>
                  <td className="pfl-exptable__actions-col">
                    <button className="pfl-exptable__action-btn" onClick={() => onView?.(e)}>View</button>
                    <button className="pfl-exptable__action-btn" onClick={() => onEdit?.(e)}>Edit</button>
                    <button className="pfl-exptable__action-btn pfl-exptable__action-btn--danger" onClick={() => onDelete?.(e)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}