import { useMemo, useState } from "react";
import { IconSearch, IconPackage } from "./Icons";
import "../Css/BatchTable.css";

function getExpiryStatus(expiryDate) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysLeft = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return "expired";
  if (daysLeft <= 30) return "nearExpiry";
  return "ok";
}

export default function BatchTable({ batches = [], onProfile, loading = false }) {
  const [search, setSearch] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("all");

  const filtered = useMemo(() => {
    return batches.filter((b) => {
      const matchesSearch =
        !search.trim() ||
        b.batchNo?.toLowerCase().includes(search.toLowerCase()) ||
        b.supplier?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesExpiry =
        expiryFilter === "all" || getExpiryStatus(b.expiryDate) === expiryFilter;

      return matchesSearch && matchesExpiry;
    });
  }, [batches, search, expiryFilter]);

  return (
    <div className="pfl-battable">
      <div className="pfl-battable__toolbar">
        <div className="pfl-battable__search">
          <IconSearch />
          <input
            type="text"
            placeholder="Search by batch number or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* <select className="pfl-battable__select" value={expiryFilter} onChange={(e) => setExpiryFilter(e.target.value)}>
          <option value="all">All Batches</option>
          <option value="ok">Good</option>
          <option value="nearExpiry">Near Expiry (≤30 days)</option>
          <option value="expired">Expired</option>
        </select> */}

        {/* {onAddNew && (
          <button className="pfl-battable__add-btn" onClick={onAddNew}>
            + Add Batch
          </button>
        )} */}
      </div>

      <div className="pfl-battable__wrap">
        <table className="pfl-battable__table">
          <thead>
            <tr>
              <th>Purchase No</th>
              <th>Product</th>
              <th>Batch No</th>
              <th>Quantity</th>
              <th>Purchase Price</th>
              {/* <th>Expiry</th> */}
              <th className="pfl-battable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="pfl-battable__empty">Loading batches...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="pfl-battable__empty">
                  <IconPackage size={22} />
                  <span>No batches match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((b) => {
                const status = getExpiryStatus(b.expireDate);
                return (
                  <tr key={b._id}>
                    <td className="pfl-battable__title">{b.purchaseId?.purchaseNumber || "—"}</td>
                    <td className="pfl-battable__title">{b.product?.name || "—"}</td>
                    <td className="pfl-battable__batchno">{b.batchNo}</td>
                    <td>{b.quantity}</td>
                    <td>PKR {Number(b.purchasePrice || 0).toLocaleString()}</td>
                    {/* <td>
                      <span className={`pfl-battable__expiry pfl-battable__expiry--${status}`}>
                        {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "—"}
                      </span>
                    </td> */}
                    <td className="pfl-battable__actions-col">
                      <button className="pfl-battable__action-btn" onClick={() => onProfile?.(b)}>Profile</button>
                      {/* <button className="pfl-battable__action-btn" onClick={() => onEdit?.(b)}>Edit</button> */}
                      {/* <button className="pfl-battable__action-btn pfl-battable__action-btn--danger" onClick={() => onDelete?.(b)}>Delete</button> */}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}