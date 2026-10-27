import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Context/AuthContext.jsx';
import ProtectedRoute from './Context/ProtectedRoutes.jsx';
import RedirectLogin from './Components/RedirectLogin.jsx';
import Login from './Pages/Login.jsx';
import DashboardLayout from './Layout/DashboardLayout.jsx';
import Dashboard from './Pages/Dashboard.jsx';
import User from './Pages/User.jsx';
import Category from './Pages/Category.jsx';
import Product from './Pages/Product.jsx';
import Supplier from './Pages/Supplier.jsx';
import SupplierLedger from './Pages/SupplierLedger.jsx';
import Batch from './Pages/Batch.jsx';
import Purchase from './Pages/Purchase.jsx';
import Customer from './Pages/Customer.jsx';
import CustomerLedger from './Pages/CustomerLedger.jsx';
import Sale from './Pages/Sale.jsx';
import Expense from './Pages/Expense.jsx';
import StockAlert from "./Pages/StockAlert.jsx";
import Report from './Pages/Report.jsx';
import CustomerScan from './Pages/CustomerScan.jsx';
import WorkshopScan from './Pages/WorkshopScan.jsx';
import Setting from './Pages/Setting.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes — no login required */}
          <Route path="/" element={<RedirectLogin />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes — requires authentication */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            } 
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="user" element={<User />} />
            <Route path="category" element={<Category />} />
            <Route path="product" element={<Product />} />
            <Route path="supplier" element={<Supplier />} />
            <Route path="suppliers/:id/ledger" element={<SupplierLedger />} />
            <Route path="batch" element={<Batch />} />
            <Route path="purchase" element={<Purchase />} />
            <Route path="customer" element={<Customer />} />
            <Route path="customers/:id/ledger" element={<CustomerLedger />} />
            <Route path="sale" element={<Sale />} />
            <Route path="expense" element={<Expense />} />
            <Route path="stockAlert" element={<StockAlert />} />
            <Route path="reports" element={<Report />} />
            <Route path="customerScan" element={<CustomerScan />} />
            <Route path="workshopScan" element={<WorkshopScan />} />
            <Route path="setting" element={<Setting />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}