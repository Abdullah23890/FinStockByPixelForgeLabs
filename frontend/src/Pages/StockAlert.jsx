import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent.jsx";
import StockAlertTable from "../Components/StockAlertTable";
import "../Css/StockAlertTable.css";

import { 
    getStockAlerts
 } from "../Api/stockAlert.api.js";

const TABS = ["Low Stock", "Out of Stock"];

export default function StockAlert() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState("Low Stock");

  async function loadData() {
    setLoading(true);
    try {
      const res = await getStockAlerts();
      setItems(res.data.data || []);
    } catch (error) {
      console.error("Failed to load stock alerts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const lowStockItems = items.filter((i) => i.status === "lowStock");
  const outOfStockItems = items.filter((i) => i.status === "outOfStock");

  return (
    <MainContent
      pageTitle="Stock Alerts"
      pageSubtitle="Products running low or completely out of stock."
      sections={[
        {
          id: "stock-alerts",
          title: null,
          content: (
            <div>
              <div className="pfl-satable__tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    className={`pfl-satable__tab ${activeTab === tab ? "is-active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                    <span className="pfl-satable__tab-count">
                      {tab === "Low Stock" ? lowStockItems.length : outOfStockItems.length}
                    </span>
                  </button>
                ))}
              </div>

              <StockAlertTable
                loading={loading}
                items={activeTab === "Low Stock" ? lowStockItems : outOfStockItems}
                emptyText={
                  activeTab === "Low Stock"
                    ? "No products are currently low on stock."
                    : "No products are completely out of stock."
                }
              />
            </div>
          ),
        },
      ]}
    />
  );
}