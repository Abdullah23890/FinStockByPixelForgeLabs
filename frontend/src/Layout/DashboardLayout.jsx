import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import Sidebar from '../Components/Sidebar';
import { useAuth } from "../Context/AuthContext.jsx";
import "../Css/Dashboard.css";

import { 
  getSetting 
} from "../Api/setting.api.js";

import {
  IconGrid,
  IconUsers,
  IconProduct,
  IconReport,
  IconBatch,
  IconCheckSquare,
  IconTruck,
  IconInvoice,
  IconWallet,
  IconTicket,
  IconSettings,
  IconScan,
} from "../Components/Icons";

export default function DashboardLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settings, setSettings] = useState(null);  
  const navigate = useNavigate();
  const location = useLocation();
  

  const ADMIN_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: IconGrid, path: "/dashboard" },
  { id: "user", label: "Users", icon: IconUsers, path: "/user" },
  { id: "category", label: "Category", icon: IconCheckSquare, path: "/category" },
  { id: "product", label: "Product", icon: IconProduct, path: "/product" },
  { id: "batch", label: "Batch", icon: IconBatch, path: "/batch" },
  { id: "stockAlert", label: "Stock Alert", icon: IconReport, path: "/stockAlert" },
  { id: "supplier", label: "Supplier", icon: IconTruck, path: "/supplier" },
  { id: "purchase", label: "Purchase", icon: IconWallet, path: "/purchase" },
  { id: "customer", label: "Customers", icon: IconUsers, path: "/customer" },
  { id: "sale", label: "Sale", icon: IconInvoice, path: "/sale" },
  { id: "expense", label: "Expense", icon: IconTicket, path: "/expense" },
  { id: "report", label: "Report", icon: IconReport, path: "/reports" },
  { id: "cscan", label: "Customer Scan", icon: IconScan, path: "/customerScan" },
  { id: "wscan", label: "WorkShop Scan", icon: IconScan, path: "/workshopScan" },
  { id: "setting", label: "Setting", icon: IconSettings, path: "/setting" },
];

const SALEMANAGER_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: IconGrid, path: "/dashboard" },
  { id: "user", label: "Users", icon: IconUsers, path: "/user" },
  { id: "category", label: "Category", icon: IconCheckSquare, path: "/category" },
  { id: "product", label: "Product", icon: IconProduct, path: "/product" },
  { id: "batch", label: "Batch", icon: IconBatch, path: "/batch" },
  { id: "stockAlert", label: "Stock Alert", icon: IconReport, path: "/stockAlert" },
  { id: "supplier", label: "Supplier", icon: IconTruck, path: "/supplier" },
  { id: "purchase", label: "Purchase", icon: IconWallet, path: "/purchase" },
  { id: "customer", label: "Customers", icon: IconUsers, path: "/customer" },
  { id: "sale", label: "Sale", icon: IconInvoice, path: "/sale" },
  { id: "expense", label: "Expense", icon: IconTicket, path: "/expense" },
  { id: "report", label: "Report", icon: IconReport, path: "/reports" },
  { id: "cscan", label: "Customer Scan", icon: IconScan, path: "/customerScan" },
  { id: "wscan", label: "WorkShop Scan", icon: IconScan, path: "/workshopScan" },
  { id: "setting", label: "Setting", icon: IconSettings, path: "/setting" },
];

const COUNTER_MENU_ITEMS = [
  { id: "category", label: "Category", icon: IconCheckSquare, path: "/category" },
  { id: "product", label: "Product", icon: IconProduct, path: "/product" },
  { id: "batch", label: "Batch", icon: IconBatch, path: "/batch" },
  { id: "customer", label: "Customers", icon: IconUsers, path: "/customer" },
  { id: "sale", label: "Sale", icon: IconInvoice, path: "/sale" },
  { id: "expense", label: "Expense", icon: IconTicket, path: "/expense" },
  { id: "cscan", label: "Customer Scan", icon: IconScan, path: "/customerScan" },
  { id: "wscan", label: "WorkShop Scan", icon: IconScan, path: "/workshopScan" },
  { id: "setting", label: "Setting", icon: IconSettings, path: "/setting" },  
];

const ROLE_MENU = {
  admin: ADMIN_MENU_ITEMS,
  saleManager: SALEMANAGER_MENU_ITEMS,
  counter: COUNTER_MENU_ITEMS,
};

const menuItems = ROLE_MENU[user?.role] || [];
const activeItem = menuItems.find((item) => item.path === location.pathname)?.id || "dashboard";
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await getSetting();
        setSettings(res.data.data);
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    loadSettings();
  }, []);

  const BRAND = {
    name: settings?.name || "Pixel Forge Labs",
    tagline: settings?.phone || "Design. Develop. Deliver.",
    logo: settings?.logo
  };

  return (
    <div className="pfl-shell">
      <Sidebar
        brand={BRAND}
        menuItems={menuItems}
        activeId={activeItem}
        onSelect={(id) => {
          const item = menuItems.find((m) => m.id === id);
          if (item) navigate(item.path);
        }}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      <Outlet />
    </div>
  );
}