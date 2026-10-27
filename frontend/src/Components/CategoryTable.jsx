import { useMemo, useState } from "react";
import "../Css/CategoryTable.css";
import { IconSearch, IconFolder } from "./Icons";

export default function CategoryTable({ categories = [], onEdit, onDelete, onAddNew, onProfile, loading = false }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return categories.filter(
      (c) => !search.trim() || c.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [categories, search]);

  return (
    <div className="pfl-cattable">
      <div className="pfl-cattable__toolbar">
        <div className="pfl-cattable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {onAddNew && (
          <button className="pfl-cattable__add-btn" onClick={onAddNew}>
            + Add Category
          </button>
        )}
      </div>

      <div className="pfl-cattable__wrap">
        <table className="pfl-cattable__table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Created</th>
              <th className="pfl-cattable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="pfl-cattable__empty">Loading categories...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="pfl-cattable__empty">
                  <IconFolder size={22} />
                  <span>No categories match your search.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((c) => (
                <tr key={c._id}>
                  <td className="pfl-cattable__name">{c.name}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="pfl-cattable__actions-col">
                    <button className="pfl-cattable__action-btn" onClick={() => onProfile?.(c)}>Profile</button>
                    <button className="pfl-cattable__action-btn" onClick={() => onEdit?.(c)}>Edit</button>
                    <button className="pfl-cattable__action-btn pfl-cattable__action-btn--danger" onClick={() => onDelete?.(c)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}