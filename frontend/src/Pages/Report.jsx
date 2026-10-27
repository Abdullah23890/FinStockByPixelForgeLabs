import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent.jsx";
import SidePanel from "../Components/SidePanel.jsx";
import ReportCard from "../Components/ReportCard.jsx";
import ReportPrintable from "../Components/ReportPrintable.jsx";

import { getCategories } from "../Api/category.api.js";
import { getProducts } from "../Api/product.api.js";
import { getBatches } from "../Api/batch.api.js";
import { getSuppliers } from "../Api/supplier.api.js";
import { getPurchases } from "../Api/purchase.api.js";
import { getPurchaseReturns } from "../Api/purchaseReturn.api.js";
import { getSupplierCreditNotes } from "../Api/supplierCreditNote.api.js";
import { getCustomers } from "../Api/customer.api.js";
import { getSales } from "../Api/sale.api.js";
import { getSaleReturns } from "../Api/saleReturn.api.js";
import { getCreditNotes } from "../Api/creditNote.api.js";
import { getExpenses } from "../Api/expense.api.js";
import { getSetting } from "../Api/setting.api.js";
import { downloadReportPdf } from "../Api/report.api.js";

import {
  buildCategoryReport,
  buildProductReport,
  buildSupplierReport,
  buildCustomerReport,
  buildExpiryReport,
  buildTopProductsReport,
  buildSalesReport,
  buildPurchaseReport,
  buildCustomerLedgerReport,
  buildSupplierLedgerReport,
  buildOverviewReport,
  buildTodayReport,
} from "../utils/reportCalculation.js";

const REPORTS = [
  { id: "today", title: "Today's Report", description: "Complete summary of today's sales, purchases, expenses & profit." }, // ✅ naya, sabse upar
  { id: "overview", title: "Overview", description: "Total sales, receivable, payable, credit notes, expenses & profit." },
  { id: "category", title: "Category Report", description: "Product count per category." },
  { id: "product", title: "Product Report", description: "Stock quantity & batch count per product." },
  { id: "supplier", title: "Supplier Report", description: "Purchases, paid, remaining & credit notes per supplier." },
  { id: "customer", title: "Customer Report", description: "Sales, paid, due & credit notes per customer." },
  { id: "expiry", title: "Expired / Near-Expiry Stock", description: "Batches expired or expiring soon." },
  { id: "topProducts", title: "Top 20 Products", description: "Best-selling products by quantity." },
  { id: "sales", title: "Sales Report", description: "Detailed list of all sales." },
  { id: "purchase", title: "Purchase Report", description: "Detailed list of all purchases." },
  { id: "customerLedger", title: "Customer Ledger (All)", description: "Complete outstanding summary per customer." },
  { id: "supplierLedger", title: "Supplier Ledger (All)", description: "Complete payable summary per supplier." },
];

export default function Report() {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  const [activeReport, setActiveReport] = useState(null);
  const [filters, setFilters] = useState({});
  const [result, setResult] = useState(null);

  async function loadAll() {
    setLoading(true);
    try {
      const [
        categoriesRes, productsRes, batchesRes, suppliersRes, purchasesRes,
        purchaseReturnsRes, supplierCreditNotesRes, customersRes, salesRes,
        saleReturnsRes, creditNotesRes, expensesRes, settingsRes,
      ] = await Promise.all([
        getCategories(), getProducts(), getBatches(), getSuppliers(), getPurchases(),
        getPurchaseReturns(), getSupplierCreditNotes(), getCustomers(), getSales(),
        getSaleReturns(), getCreditNotes(), getExpenses(), getSetting(),
      ]);

      setRaw({
        categories: categoriesRes.data.data,
        products: productsRes.data.data,
        batches: batchesRes.data.data,
        suppliers: suppliersRes.data.data,
        purchases: purchasesRes.data.data,
        purchaseReturns: purchaseReturnsRes.data.data,
        supplierCreditNotes: supplierCreditNotesRes.data.data,
        customers: customersRes.data.data,
        sales: salesRes.data.data,
        saleReturns: saleReturnsRes.data.data,
        creditNotes: creditNotesRes.data.data,
        expenses: expensesRes.data.data,
      });
      setSettings(settingsRes.data.data);
    } catch (err) {
      console.error("Failed to load report data:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function openReport(reportId) {
    setActiveReport(reportId);
    setFilters({});
    setResult(null);
  }

  function closeReport() {
    setActiveReport(null);
    setResult(null);
  }

  function generate() {
    if (!raw) return;

    switch (activeReport) {
      case "overview":
        setResult({ isOverview: true, overviewData: buildOverviewReport(raw) });
        break;
      case "today":
        setResult(buildTodayReport(raw));
        break;
      case "category":
        setResult(buildCategoryReport(raw.categories, raw.products));
        break;
      case "product":
        setResult(buildProductReport(raw.products, raw.batches, filters));
        break;
      case "supplier":
        setResult(buildSupplierReport(raw.suppliers, raw.purchases, raw.supplierCreditNotes, filters));
        break;
      case "customer":
        setResult(buildCustomerReport(raw.customers, raw.sales, raw.creditNotes, filters));
        break;
      case "expiry":
        setResult(buildExpiryReport(raw.batches, filters));
        break;
      case "topProducts":
        setResult(buildTopProductsReport(raw.sales, filters));
        break;
      case "sales":
        setResult(buildSalesReport(raw.sales, filters));
        break;
      case "purchase":
        setResult(buildPurchaseReport(raw.purchases, filters));
        break;
      case "customerLedger":
        setResult(buildCustomerLedgerReport(raw.customers, raw.sales, raw.saleReturns));
        break;
      case "supplierLedger":
        setResult(buildSupplierLedgerReport(raw.suppliers, raw.purchases, raw.purchaseReturns));
        break;
      default:
        break;
    }
  }

  // function handlePrint() {
  //   setTimeout(() => window.print(), 150);
  // }

  async function handleDownload() {
    await downloadReportPdf(activeReport, filters);
  }

  const activeMeta = REPORTS.find((r) => r.id === activeReport);

  return (
    <>
      <MainContent
        pageTitle="Reports"
        pageSubtitle="Generate and download business reports."
        sections={[
          {
            id: "reports",
            title: null,
            content: loading ? (
              <p>Loading report data...</p>
            ) : (
              <div className="pfl-reports-grid">
                {REPORTS.map((r) => (
                  <ReportCard
                    key={r.id}
                    title={r.title}
                    description={r.description}
                    onGenerate={() => openReport(r.id)}
                  />
                ))}
              </div>
            ),
          },
        ]}
      />

      <SidePanel open={activeReport !== null} onClose={closeReport} title={activeMeta?.title || "Report"}>
        {activeReport !== "overview" && activeReport !== "category" && activeReport !== "customerLedger" && activeReport !== "supplierLedger" && activeReport !== "today" && (
          <div className="pfl-report-filters">
            {["product", "sales", "purchase", "supplier", "customer", "topProducts", "today"].includes(activeReport) && (
              <>
                <label>
                  From
                  <input type="date" value={filters.from || ""} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
                </label>
                <label>
                  To
                  <input type="date" value={filters.to || ""} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
                </label>
              </>
            )}

            {activeReport === "product" && (
              <label>
                Category
                <select value={filters.category || ""} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  <option value="">All</option>
                  {raw?.categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </label>
            )}

            {activeReport === "customer" && (
              <label>
                Channel
                <select value={filters.channel || ""} onChange={(e) => setFilters({ ...filters, channel: e.target.value })}>
                  <option value="">All</option>
                  <option value="retail">Retail</option>
                  <option value="wholeSale">Wholesale</option>
                  <option value="parlor">Parlor</option>
                </select>
              </label>
            )}

            {activeReport === "sales" && (
              <>
                <label>
                  Channel
                  <select value={filters.channel || ""} onChange={(e) => setFilters({ ...filters, channel: e.target.value })}>
                    <option value="">All</option>
                    <option value="retail">Retail</option>
                    <option value="wholeSale">Wholesale</option>
                    <option value="parlor">Parlor</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={filters.status || ""} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                    <option value="">All</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="unPaid">Unpaid</option>
                  </select>
                </label>
              </>
            )}

            {activeReport === "purchase" && (
              <label>
                Status
                <select value={filters.status || ""} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  <option value="">All</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unPaid">Unpaid</option>
                </select>
              </label>
            )}

            {activeReport === "expiry" && (
              <label>
                Days ahead
                <input
                  type="number"
                  min="0"
                  value={filters.daysAhead || 0}
                  onChange={(e) => setFilters({ ...filters, daysAhead: e.target.value })}
                  placeholder="e.g. 30"
                />
              </label>
            )}

            <button className="pfl-reportcard__btn" onClick={generate}>
              Apply
            </button>
          </div>
        )}

        {(activeReport === "today" || activeReport === "overview" || activeReport === "category" || activeReport === "customerLedger" || activeReport === "supplierLedger") && !result && (
          <button className="pfl-reportcard__btn" onClick={generate} style={{ marginBottom: 16 }}>
            Generate
          </button>
        )}

        {result && (
          <>
            <ReportPrintable
              title={activeMeta?.title}
              settings={settings}
              columns={result.columns}
              rows={result.rows}
              summary={result.summary}
              isOverview={result.isOverview}
              overviewData={result.overviewData}
            />
            <button className="pfl-reportcard__btn" onClick={handleDownload} style={{ marginTop: 14 }}>
              Download PDF
            </button>
          </>
        )}
      </SidePanel>
    </>
  );
}