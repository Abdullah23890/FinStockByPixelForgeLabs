import { useMemo, useState } from "react";
import "../Css/CustomerTable.css";
import { IconSearch, IconUsers } from "./Icons";

const TYPE_LABELS = {
  retail: "Retail",
  wholeSale: "Wholesale",
  // parlor: "Parlor",
};

export default function CustomerTable({ customers = [], onEdit, onProfile, onLedger, onAddNew, loading = false }) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        !search.trim() ||
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.contactNo?.includes(search);

      const matchesType = typeFilter === "all" || c.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [customers, search, typeFilter]);

  return (
    <div className="pfl-custtable">
      <div className="pfl-custtable__toolbar">
        <div className="pfl-custtable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by name or contact number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="pfl-custtable__select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="retail">Retail</option>
          <option value="wholeSale">Wholesale</option>
          {/* <option value="parlor">Parlor</option> */}
        </select>

        {onAddNew && (
          <button className="pfl-custtable__add-btn" onClick={onAddNew}>
            + Add Customer
          </button>
        )}
      </div>

      <div className="pfl-custtable__wrap">
        <table className="pfl-custtable__table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Type</th>
              <th>Contact</th>
              {/* <th>Credit Limit</th> */}
              <th className="pfl-custtable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="pfl-custtable__empty">Loading customers...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="pfl-custtable__empty">
                  <IconUsers size={22} />
                  <span>No customers match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="pfl-custtable__customer">
                      <span className="pfl-custtable__avatar">{(c.name || "C").charAt(0).toUpperCase()}</span>
                      <span>{c.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`pfl-custtable__type pfl-custtable__type--${c.type}`}>
                      {TYPE_LABELS[c.type] || c.type}
                    </span>
                  </td>
                  <td>{c.contactNo || "—"}</td>
                  {/* <td>{c.creditLimit != null ? `PKR ${Number(c.creditLimit).toLocaleString()}` : "—"}</td> */}
                  <td className="pfl-custtable__actions-col">
                    <button className="pfl-custtable__action-btn pfl-custtable__action-btn--ledger" onClick={() => onLedger?.(c)}>
                      Ledger
                    </button>
                    <button className="pfl-custtable__action-btn" onClick={() => onProfile?.(c)}>Profile</button>
                    <button className="pfl-custtable__action-btn" onClick={() => onEdit?.(c)}>Edit</button>
                    {/* <button className="pfl-custtable__action-btn pfl-custtable__action-btn--danger" onClick={() => onDelete?.(c)}>Delete</button> */}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}