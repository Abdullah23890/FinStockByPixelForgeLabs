import { useMemo, useState } from "react";
import "../Css/SaleTable.css";
import { IconSearch, IconWallet } from "./Icons";

const CHANNEL_LABELS = { retail: "Retail", wholeSale: "Wholesale" };
const STATUS_LABELS = { paid: "Paid", partial: "Partial", unPaid: "Unpaid" };

export default function SaleTable({ sales = [], onView, onDelete, onAddPayment, onAddNew, onPrint, loading = false }) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return sales.filter((s) => {
      const matchesSearch =
        !search.trim() ||
        (s.saleNumber || s.saleNo || "")?.toLowerCase().includes(search.toLowerCase()) ||
        s.customer?.name?.toLowerCase().includes(search.toLowerCase());

      const matchesChannel = channelFilter === "all" || s.channel === channelFilter;
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [sales, search, channelFilter, statusFilter]);

  return (
    <div className="pfl-saletable">
      <div className="pfl-saletable__toolbar">
        <div className="pfl-saletable__search">
          <IconSearch size={16} />
          <input
            type="text"
            placeholder="Search by sale # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select className="pfl-saletable__select" value={channelFilter} onChange={(e) => setChannelFilter(e.target.value)}>
          <option value="all">All Channels</option>
          <option value="retail">Retail</option>
          <option value="wholeSale">Wholesale</option>
          <option value="parlor">Parlor</option>
        </select>

        <select className="pfl-saletable__select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="unPaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
        </select>

        {onAddNew && (
          <button className="pfl-saletable__add-btn" onClick={onAddNew}>
            + New Sale
          </button>
        )}
      </div>

      <div className="pfl-saletable__wrap">
        <table className="pfl-saletable__table">
          <thead>
            <tr>
              <th>Sale #</th>
              <th>Channel</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
              <th>Date</th>
              <th className="pfl-saletable__actions-col">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="pfl-saletable__empty">Loading sales...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="pfl-saletable__empty">
                  <IconWallet size={22} />
                  <span>No sales match your search/filter.</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((s) => (
                <tr key={s._id}>
                  <td className="pfl-saletable__number">{s.saleNumber}</td>
                  <td>
                    <span className={`pfl-saletable__channel pfl-saletable__channel--${s.channel}`}>
                      {CHANNEL_LABELS[s.channel] || s.channel}
                    </span>
                  </td>
                  <td>{s.customer?.name || "Walk-in"}</td>
                  <td>PKR {Number(s.totalAmount || 0).toLocaleString()}</td>
                  <td>PKR {Number(s.paidAmount || 0).toLocaleString()}</td>
                  <td>PKR {Number(s.dueAmount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`pfl-saletable__status pfl-saletable__status--${s.status}`}>
                      {STATUS_LABELS[s.status] || s.status}
                    </span>
                  </td>
                  <td>{s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "—"}</td>
                  <td className="pfl-saletable__actions-col">
                    <button className="pfl-saletable__action-btn" onClick={() => onView?.(s)}>View</button>
                    {s.dueAmount > 0 && (
                      <button className="pfl-saletable__action-btn pfl-saletable__action-btn--primary" onClick={() => onAddPayment?.(s)}>
                        Add Payment
                      </button>
                    )}
                    {s.paidAmount === 0 && (
                      <button className="pfl-saletable__action-btn pfl-saletable__action-btn--danger" onClick={() => onDelete?.(s)}>
                      Delete
                      </button>
                    )}
                    <button className="pfl-saleform__btn pfl-saleform__btn--primary" onClick={() => onPrint?.(s)}>
                      Print ({s.printSize === "thermal" ? "Thermal" : "A4"})
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}