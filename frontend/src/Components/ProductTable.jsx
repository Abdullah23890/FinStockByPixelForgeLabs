import { useMemo, useState } from "react";
import "../Css/ProductTable.css";
import { IconSearch, IconFolder } from "./Icons";

export default function ProductTable({ products = [], onEdit, onDelete, onProfile, onAddNew, loading = false }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  return (
    <div className="pfl-prtable">
      <div className="pfl-prtable__toolbar">
        <div className="pfl-prtable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by name or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="pfl-prtable__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inActive">Inactive</option>
        </select>

        {onAddNew && (
          <button className="pfl-prtable__add-btn" onClick={onAddNew}>
            + Add Product
          </button>
        )}
      </div>

      <div className="pfl-prtable__wrap">
        <table className="pfl-prtable__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Barcode</th>
              <th>Retail</th>
              <th>Wholesale</th>
              {/* <th>Parlor</th> */}
              <th>Status</th>
              <th className="pfl-prtable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="pfl-prtable__empty">Loading products...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="pfl-prtable__empty">
                  <IconFolder size={22} />
                  <span>No products match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((p) => (
                <tr key={p._id}>
                  <td className="pfl-prtable__title">{p.name}</td>
                  <td>{p.category?.name || "—"}</td>
                  <td className="pfl-prtable__barcode">{p.barcode}</td>
                  <td>PKR {Number(p.retailPrice || 0).toLocaleString()}</td>
                  <td>PKR {Number(p.wholesalePrice || 0).toLocaleString()}</td>
                  {/* <td>PKR {Number(p.parlorPrice || 0).toLocaleString()}</td> */}
                  <td>
                    <span className={`pfl-prtable__status pfl-prtable__status--${p.status}`}>
                      {p.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="pfl-prtable__actions-col">
                    <button className="pfl-prtable__action-btn" onClick={() => onProfile?.(p)}>Profile</button>
                    <button className="pfl-prtable__action-btn" onClick={() => onEdit?.(p)}>Edit</button>
                    <button className="pfl-prtable__action-btn pfl-prtable__action-btn--danger" onClick={() => onDelete?.(p)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}