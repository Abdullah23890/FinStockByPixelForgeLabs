import { useMemo, useState } from "react";
import "../Css/SupplierTable.css";
import { IconSearch, IconTruck } from "./Icons";

export default function SupplierTable({ suppliers = [], onEdit, onProfile, onLedger, onAddNew, loading = false }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return suppliers.filter(
      (s) =>
        !search.trim() ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.contactNo?.includes(search)
    );
  }, [suppliers, search]);

  return (
    <div className="pfl-suptable">
      <div className="pfl-suptable__toolbar">
        <div className="pfl-suptable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by name or contact number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {onAddNew && (
          <button className="pfl-suptable__add-btn" onClick={onAddNew}>
            + Add Supplier
          </button>
        )}
      </div>

      <div className="pfl-suptable__wrap">
        <table className="pfl-suptable__table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact</th>
              <th>Address</th>
              <th className="pfl-suptable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={4} className="pfl-suptable__empty">Loading suppliers...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="pfl-suptable__empty">
                  <IconTruck size={22} />
                  <span>No suppliers match your search.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div className="pfl-suptable__supplier">
                      <span className="pfl-suptable__avatar">
                        <IconTruck size={15} />
                      </span>
                      <span>{s.name}</span>
                    </div>
                  </td>
                  <td>{s.contactNo || "—"}</td>
                  <td>{s.address || "—"}</td>
                  <td className="pfl-suptable__actions-col">
                    <button className="pfl-suptable__action-btn pfl-suptable__action-btn--ledger" onClick={() => onLedger?.(s)}>
                      Ledger
                    </button>
                    <button className="pfl-suptable__action-btn" onClick={() => onProfile?.(s)}>Profile</button>
                    <button className="pfl-suptable__action-btn" onClick={() => onEdit?.(s)}>Edit</button>
                    {/* <button className="pfl-suptable__action-btn pfl-suptable__action-btn--danger" onClick={() => onDelete?.(s)}>Delete</button> */}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}