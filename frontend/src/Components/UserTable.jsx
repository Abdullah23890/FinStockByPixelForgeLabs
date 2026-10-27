import { useMemo, useState } from "react";
import "../Css/UserTable.css";
import { IconSearch, IconUsers } from "./Icons";

const ROLE_LABELS = {
  admin: "Admin",
  saleManager: "Sale Manager",
  counter: "Counter",
};

export default function UserTable({ users = [], onEdit, onDelete, onProfile, onAddNew, loading = false }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        !search.trim() ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.userName?.toLowerCase().includes(search.toLowerCase()) ||
        u.phone?.includes(search);

      const matchesRole = roleFilter === "all" || u.role === roleFilter;
      const matchesStatus = statusFilter === "all" || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  return (
    <div className="pfl-utable">
      <div className="pfl-utable__toolbar">
        <div className="pfl-utable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by name, username, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="pfl-utable__select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>

        <select className="pfl-utable__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="resigned">Resigned</option>
        </select>

        {onAddNew && (
          <button className="pfl-utable__add-btn" onClick={onAddNew}>
            + Add User
          </button>
        )}
      </div>

      <div className="pfl-utable__wrap">
        <table className="pfl-utable__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Status</th>
              <th className="pfl-utable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="pfl-utable__empty">Loading users...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="pfl-utable__empty">
                  <IconUsers size={22} />
                  <span className="text-center">No users match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="pfl-utable__user">
                      <span className="pfl-utable__avatar">{(u.name || "U").charAt(0).toUpperCase()}</span>
                      <span>{u.name}</span>
                    </div>
                  </td>
                  <td>{u.userName}</td>
                  <td>
                    <span className={`pfl-utable__role pfl-utable__role--${u.role}`}>
                      {ROLE_LABELS[u.role] || u.role}
                    </span>
                  </td>
                  <td>{u.phone || "—"}</td>
                  <td>
                    <span className={`pfl-utable__status pfl-utable__status--${u.status}`}>
                      {u.status === "active" ? "Active" : "Resigned"}
                    </span>
                  </td>
                  <td className="pfl-utable__actions-col">
                    <button className="pfl-utable__action-btn" onClick={() => onProfile?.(u)}>Profile</button>
                    <button className="pfl-utable__action-btn" onClick={() => onEdit?.(u)}>Edit</button>
                    <button className="pfl-utable__action-btn pfl-utable__action-btn--danger" onClick={() => onDelete?.(u)}>Delete</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}