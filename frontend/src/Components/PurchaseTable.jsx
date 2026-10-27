import { useMemo, useState } from "react";
import "../Css/PurchaseTable.css";
import { IconSearch, IconBatch } from "./Icons";

export default function PurchaseTable({ purchases = [], onView, onEdit, onAddPayment, onAddNew, loading = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return purchases.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.purchaseNumber?.toLowerCase().includes(search.toLowerCase()) ||
        p.supplier?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [purchases, search, statusFilter]);

  const statusLabel = { paid: "Paid", partial: "Partial", unPaid: "Unpaid" };

  return (
    <div className="pfl-purtable">
      <div className="pfl-purtable__toolbar">
        <div className="pfl-purtable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by purchase # or supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="pfl-purtable__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="unPaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>

        {onAddNew && (
          <button className="pfl-purtable__add-btn" onClick={onAddNew}>
            + New Purchase
          </button>
        )}
      </div>

      <div className="pfl-purtable__wrap">
        <table className="pfl-purtable__table">
          <thead>
            <tr>
              <th>Purchase #</th>
              <th>Supplier</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Remaining</th>
              <th>Status</th>
              <th>Date</th>
              <th className="pfl-purtable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="pfl-purtable__empty">Loading purchases...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="pfl-purtable__empty">
                  <IconBatch size={22} />
                  <span>No purchases match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((p) => (
                <tr key={p._id}>
                  <td className="pfl-purtable__number">{p.purchaseNumber}</td>
                  <td>{p.supplier?.name || "—"}</td>
                  <td>PKR {Number(p.totalAmount || 0).toLocaleString()}</td>
                  <td>PKR {Number(p.paidAmount || 0).toLocaleString()}</td>
                  <td>PKR {Number(p.remainingAmount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`pfl-purtable__status pfl-purtable__status--${p.status}`}>
                      {statusLabel[p.status] || p.status}
                    </span>
                  </td>
                  <td>{p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : "—"}</td>
                  <td className="pfl-purtable__actions-col">
                    <button className="pfl-purtable__action-btn" onClick={() => onView?.(p)}>View</button>
                    <button className="pfl-purtable__action-btn" onClick={() => onEdit?.(p)}>Edit</button>
                    {p.remainingAmount > 0 && (
                    <button className="pfl-purtable__action-btn pfl-purtable__action-btn--primary" onClick={() => onAddPayment?.(p)}>Add Payment</button>
                    )}
                    {/* <button className="pfl-purtable__action-btn pfl-purtable__action-btn--danger" onClick={() => onDelete?.(p)}>Delete</button> */}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}