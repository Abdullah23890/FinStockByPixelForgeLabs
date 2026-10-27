import { useState, useMemo } from "react";
import "../Css/StockAlertTable.css";
import { IconSearch, IconFolder } from "./Icons";

export default function StockAlertTable({ loading = false, items = [], emptyText = "No products match your search/filter." }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return items.filter(
      (i) =>
        !search.trim() ||
        i.productName?.toLowerCase().includes(search.toLowerCase()) ||
        i.barcode?.toLowerCase().includes(search.toLowerCase())
    );
  }, [items, search]);

  return (
    <div className="pfl-satable">
      <div className="pfl-satable__toolbar">
        <div className="pfl-satable__search">
          <IconSearch size={16} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or barcode..."
          />
        </div>
      </div>

      <div className="pfl-satable__wrap">
        <table className="pfl-satable__table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Barcode</th>
              <th>Current Qty</th>
              <th>Alert Level</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="pfl-satable__empty">Loading...</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="pfl-satable__empty">
                  <IconFolder size={22} />
                  <span>{emptyText}</span>
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((item) => (
                <tr key={item.productId}>
                  <td className="pfl-satable__title">{item.productName}</td>
                  <td>{item.categoryName || "—"}</td>
                  <td className="pfl-satable__barcode">{item.barcode}</td>
                  <td className={item.totalStock === 0 ? "pfl-satable__qty--zero" : "pfl-satable__qty--low"}>
                    {item.totalStock}
                  </td>
                  <td>7</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}