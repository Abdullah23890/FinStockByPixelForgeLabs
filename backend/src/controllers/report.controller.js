import Category from "../models/Categories.js";
import Products from "../models/Products.js";
import Batches from "../models/Batches.js";
import Suppliers from "../models/Suppliers.js";
import Purchases from "../models/Purchases.js";
import PurchaseReturns from "../models/PurchaseReturn.js";
import SupplierCreditNotes from "../models/SupplierCreditNote.js";
import Customers from "../models/Customers.js";
import Sales from "../models/Sales.js";
import SaleReturns from "../models/SaleReturn.js";
import CreditNotes from "../models/CreditNote.js";
import Expenses from "../models/Expenses.js";
import Settings from "../models/Setting.js";
import { buildReportPdf } from "../utils/pdfHelper.js";
import { calcTotalProfit } from "../utils/profitCalculation.js";

function actualAmount(doc) {
    return Number(doc.netAmount ?? doc.totalAmount ?? 0);
}

function inRange(date, from, to) {
    if (!date) return true;
    const d = new Date(date).getTime();
    if (from && d < new Date(from).getTime()) return false;
    if (to && d > new Date(to).setHours(23, 59, 59, 999)) return false;
    return true;
}

export const generateReportPdf = async (req, res) => {
    try {
        const { type } = req.params;
        const filters = req.query;
        const settings = await Settings.findOne();

        const filtersApplied = [];
        if (filters.from) filtersApplied.push(`From: ${filters.from}`);
        if (filters.to) filtersApplied.push(`To: ${filters.to}`);
        if (filters.channel) filtersApplied.push(`Channel: ${filters.channel}`);
        if (filters.status) filtersApplied.push(`Status: ${filters.status}`);
        if (filters.category) filtersApplied.push(`Category: ${filters.category}`);
        if (filters.daysAhead) filtersApplied.push(`Days ahead: ${filters.daysAhead}`);

        let title, columns, rows, summary, isOverview = false, overviewData = null;

        switch (type) {
            case "overview": {
                const [sales, purchases, expenses, supplierCreditNotes, creditNotes, saleReturns, purchaseReturns] = await Promise.all([
                    Sales.find().populate("items.batch", "purchasePrice"),
                    Purchases.find(),
                    Expenses.find(),
                    SupplierCreditNotes.find(),
                    CreditNotes.find(),
                    SaleReturns.find(),
                    PurchaseReturns.find(),
                ]);
                title = "Overview Report";
                isOverview = true;

                const totalSale = sales.reduce((s, x) => s + actualAmount(x), 0);
                const totalPurchase = purchases.reduce((s, x) => s + actualAmount(x), 0);
                const totalReturnSale = saleReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
                const totalReturnPurchase = purchaseReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
                const totalReceivable = sales.reduce((s, x) => s + Number(x.dueAmount || 0), 0);
                const totalPayable = purchases.reduce((s, x) => s + Number(x.remainingAmount || 0), 0);
                const totalCNSupplier = supplierCreditNotes.filter(c => c.status === "active").reduce((s, c) => s + Number(c.remainingAmount || 0), 0);
                const totalCNCustomer = creditNotes.filter(c => c.status === "active").reduce((s, c) => s + Number(c.remainingAmount || 0), 0);
                const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

                const grossProfit = calcTotalProfit(sales);

                overviewData = {
                    "Total Sale (Net)": totalSale,
                    "Total Purchase (Net)": totalPurchase,
                    "Total Return Sale": totalReturnSale,
                    "Total Return Purchase": totalReturnPurchase,
                    "Total Receivable": totalReceivable,
                    "Total Payable": totalPayable,
                    "Supplier Credit Notes": totalCNSupplier,
                    "Customer Credit Notes": totalCNCustomer,
                    "Total Expense": totalExpense,
                    "Net Profit": grossProfit - totalExpense,
                };
                break;
            }
            case "category": {
                const [categories, products] = await Promise.all([Category.find(), Products.find()]);
                title = "Category Report";
                columns = [{ key: "category", label: "Category" }, { key: "totalProducts", label: "Total Products" }];
                rows = categories.map(cat => ({
                    category: cat.name,
                    totalProducts: products.filter(p => String(p.category) === String(cat._id)).length,
                }));
                summary = { "Total Categories": categories.length, "Total Products": products.length };
                break;
            }

            case "product": {
                const [products, batches] = await Promise.all([Products.find().populate("category", "name"), Batches.find()]);
                let list = products;
                if (filters.category) list = list.filter(p => String(p.category?._id || p.category) === filters.category);
                title = "Product Report";
                columns = [
                    { key: "product", label: "Product" }, { key: "barcode", label: "Barcode" },
                    { key: "category", label: "Category" }, { key: "totalQty", label: "Total Qty" },
                    { key: "totalBatches", label: "Total Batches" },
                ];
                rows = list.map(p => {
                    const pBatches = batches.filter(b => String(b.product) === String(p._id));
                    return {
                        product: p.name, barcode: p.barcode, category: p.category?.name || "—",
                        totalQty: pBatches.reduce((s, b) => s + Number(b.quantity || 0), 0),
                        totalBatches: pBatches.length,
                    };
                });
                summary = { "Total Products": rows.length };
                break;
            }

            case "today": {
                const now = new Date();
                const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
                const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

                const [sales, purchases, expenses, saleReturns, purchaseReturns] = await Promise.all([
                    Sales.find({ saleDate: { $gte: todayStart, $lte: todayEnd } })
                        .populate("customer", "name")
                        .populate("items.product", "name")
                        .populate("items.batch", "purchasePrice"),
                    Purchases.find({ purchaseDate: { $gte: todayStart, $lte: todayEnd } }).populate("supplier", "name"),
                    Expenses.find({ date: { $gte: todayStart, $lte: todayEnd } }),
                    SaleReturns.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
                    PurchaseReturns.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }),
                ]);

                title = "Today's Report";
                isOverview = true;

                const totalSale = sales.reduce((s, x) => s + actualAmount(x), 0);
                const totalPurchase = purchases.reduce((s, x) => s + actualAmount(x), 0);
                const totalReturnSale = saleReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
                const totalReturnPurchase = purchaseReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
                const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
                const totalReceivable = sales.reduce((s, x) => s + Number(x.dueAmount || 0), 0);
                const totalPayable = purchases.reduce((s, x) => s + Number(x.remainingAmount || 0), 0);

                const paidCount = sales.filter((s) => s.status === "paid").length;
                const unpaidCount = sales.filter((s) => s.status === "unPaid").length;
                const partialCount = sales.filter((s) => s.status === "partial").length;

                const todayGrossProfit = calcTotalProfit(sales);
                const todayProfit = todayGrossProfit - totalExpense;

                overviewData = {
                    "Total Sale": totalSale,
                    "Total Purchase": totalPurchase,
                    "Total Return Sale": totalReturnSale,
                    "Total Return Purchase": totalReturnPurchase,
                    "Total Receivable": totalReceivable,
                    "Total Payable": totalPayable,
                    "Today's Expense": totalExpense,
                    "Today's Profit": todayProfit,
                };

                // ===== Products sold today — table ke roop mein bhi chahiye =====
                const productMap = new Map();
                for (const sale of sales) {
                    for (const item of sale.items || []) {
                        const key = String(item.product?._id || item.product);
                        const name = item.product?.name || "—";
                        if (!productMap.has(key)) productMap.set(key, { product: name, qtySold: 0, revenue: 0 });
                        const e = productMap.get(key);
                        e.qtySold += Number(item.quantity || 0);
                        e.revenue += Number(item.total || 0);
                    }
                }

                columns = [
                    { key: "product", label: "Product" },
                    { key: "qtySold", label: "Qty Sold" },
                    { key: "revenue", label: "Revenue", money: true },
                ];
                rows = [...productMap.values()].sort((a, b) => b.qtySold - a.qtySold);

                summary = {
                    "Total Sales Count": sales.length,
                    "Paid": paidCount,
                    "Partial": partialCount,
                    "Unpaid": unpaidCount,
                };
                break;
            }

            case "supplier": {
                const [suppliers, purchases, supplierCreditNotes] = await Promise.all([
                    Suppliers.find(), Purchases.find().populate("supplier", "name"), SupplierCreditNotes.find(),
                ]);
                title = "Supplier Report";
                columns = [
                    { key: "supplier", label: "Supplier" }, { key: "contact", label: "Contact" },
                    { key: "totalPurchases", label: "Total Purchases", money: true },
                    { key: "totalPaid", label: "Total Paid", money: true },
                    { key: "remaining", label: "Remaining", money: true },
                    { key: "creditNotes", label: "Credit Note", money: true },
                ];
                rows = suppliers.map(s => {
                    const sPurchases = purchases.filter(p => String(p.supplier?._id || p.supplier) === String(s._id) && inRange(p.purchaseDate, filters.from, filters.to));
                    const cn = supplierCreditNotes.filter(c => String(c.supplier) === String(s._id) && c.status === "active").reduce((sum, c) => sum + Number(c.remainingAmount || 0), 0);
                    return {
                        supplier: s.name, contact: s.contactNo || "—",
                        totalPurchases: sPurchases.reduce((sum, p) => sum + Number(actualAmount(p) || 0), 0),
                        totalPaid: sPurchases.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0),
                        remaining: sPurchases.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0),
                        creditNotes: cn,
                    };
                });
                summary = { "Total Payable": rows.reduce((s, r) => s + r.remaining, 0) };
                break;
            }

            case "customer": {
                const [customers, sales, creditNotes] = await Promise.all([Customers.find(), Sales.find(), CreditNotes.find()]);
                let list = customers;
                if (filters.channel) list = list.filter(c => c.type === filters.channel);
                title = "Customer Report";
                columns = [
                    { key: "customer", label: "Customer" }, { key: "channel", label: "Channel" },
                    { key: "contact", label: "Contact" },
                    { key: "totalSales", label: "Total Sales", money: true },
                    { key: "totalPaid", label: "Total Paid", money: true },
                    { key: "due", label: "Due", money: true },
                    { key: "creditNotes", label: "Credit Note", money: true },
                ];
                rows = list.map(c => {
                    const cSales = sales.filter(s => String(s.customer) === String(c._id) && inRange(s.saleDate, filters.from, filters.to));
                    const cn = creditNotes.filter(x => String(x.customer) === String(c._id) && x.status === "active").reduce((sum, x) => sum + Number(x.remainingAmount || 0), 0);
                    return {
                        customer: c.name, channel: c.type, contact: c.contactNo || "—",
                        totalSales: cSales.reduce((s, x) => s + actualAmount(x), 0),
                        totalPaid: cSales.reduce((s, x) => s + Number(x.paidAmount || 0), 0),
                        due: cSales.reduce((s, x) => s + Number(x.dueAmount || 0), 0),
                        creditNotes: cn,
                    };
                });
                summary = { "Total Receivable": rows.reduce((s, r) => s + r.due, 0) };
                break;
            }

            case "expiry": {
                const batches = await Batches.find().populate("product", "name");
                const days = Number(filters.daysAhead || 0);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() + days);
                const now = new Date();
                title = "Expired / Near-Expiry Stock Report";
                columns = [
                    { key: "product", label: "Product" }, { key: "batchNo", label: "Batch No" },
                    { key: "expiryDate", label: "Expiry Date" }, { key: "qty", label: "Qty" }, { key: "status", label: "Status" },
                ];
                rows = batches
                    .filter(b => b.expiryDate && new Date(b.expiryDate) <= cutoff && Number(b.quantity) > 0)
                    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                    .map(b => ({
                        product: b.product?.name || "—", batchNo: b.batchNo,
                        expiryDate: new Date(b.expiryDate).toLocaleDateString(), qty: b.quantity,
                        status: new Date(b.expiryDate) < now ? "Expired" : "Near Expiry",
                    }));
                summary = { "Total Batches": rows.length };
                break;
            }

            case "topProducts": {
                const sales = await Sales.find().populate("items.product", "name");
                title = "Top 20 Products Report";
                const map = new Map();
                for (const sale of sales) {
                    if (!inRange(sale.saleDate, filters.from, filters.to)) continue;
                    for (const item of sale.items || []) {
                        const key = String(item.product?._id || item.product);
                        if (!map.has(key)) map.set(key, { product: item.product?.name || "—", qtySold: 0, revenue: 0 });
                        const e = map.get(key);
                        e.qtySold += Number(item.quantity || 0);
                        e.revenue += Number(item.total || 0);
                    }
                }
                columns = [{ key: "rank", label: "#" }, { key: "product", label: "Product" }, { key: "qtySold", label: "Qty Sold" }, { key: "revenue", label: "Revenue", money: true }];
                rows = [...map.values()].sort((a, b) => b.qtySold - a.qtySold).slice(0, 20).map((r, i) => ({ rank: i + 1, ...r }));
                summary = { "Total Revenue (Top 20)": rows.reduce((s, r) => s + r.revenue, 0) };
                break;
            }

            case "sales": {
                const sales = await Sales.find().populate("customer", "name");
                title = "Sales Report";
                columns = [
                    { key: "date", label: "Date" }, { key: "saleNo", label: "Sale No" }, { key: "channel", label: "Channel" },
                    { key: "customer", label: "Customer" }, { key: "total", label: "Total", money: true },
                    { key: "paid", label: "Paid", money: true }, { key: "due", label: "Due", money: true }, { key: "status", label: "Status" },
                ];
                rows = sales
                    .filter(s => inRange(s.saleDate, filters.from, filters.to) && (!filters.channel || s.channel === filters.channel) && (!filters.status || s.status === filters.status))
                    .map(s => ({
                        date: s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "—",
                        saleNo: s.saleNumber, channel: s.channel, customer: s.customer?.name || "Walk-in",
                        total: actualAmount(s), paid: s.paidAmount, due: s.dueAmount, status: s.status,
                    }));
                summary = { "Total Sales": rows.reduce((s, r) => s + Number(r.total || 0), 0), "Total Due": rows.reduce((s, r) => s + Number(r.due || 0), 0) };
                break;
            }

            case "purchase": {
                const purchases = await Purchases.find().populate("supplier", "name");
                title = "Purchase Report";
                columns = [
                    { key: "date", label: "Date" }, { key: "purchaseNo", label: "Purchase No" }, { key: "supplier", label: "Supplier" },
                    { key: "total", label: "Total", money: true }, { key: "paid", label: "Paid", money: true },
                    { key: "remaining", label: "Remaining", money: true }, { key: "status", label: "Status" },
                ];
                rows = purchases
                    .filter(p => inRange(p.purchaseDate, filters.from, filters.to) && (!filters.status || p.status === filters.status))
                    .map(p => ({
                        date: p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : "—",
                        purchaseNo: p.purchaseNumber, supplier: p.supplier?.name || "—",
                        total: actualAmount(p), paid: p.paidAmount, remaining: p.remainingAmount, status: p.status,
                    }));
                summary = { "Total Purchases": rows.reduce((s, r) => s + Number(r.total || 0), 0), "Total Payable": rows.reduce((s, r) => s + Number(r.remaining || 0), 0) };
                break;
            }

            case "customerLedger": {
                const [customers, sales, saleReturns] = await Promise.all([Customers.find(), Sales.find(), SaleReturns.find()]);
                title = "Customer Ledger (Complete)";
                columns = [
                    { key: "customer", label: "Customer" }, { key: "channel", label: "Channel" },
                    { key: "totalSales", label: "Total Sales", money: true }, { key: "totalPaid", label: "Total Paid", money: true },
                    { key: "totalReturns", label: "Total Returns", money: true }, { key: "outstanding", label: "Outstanding", money: true },
                ];
                rows = customers.map(c => {
                    const cSales = sales.filter(s => String(s.customer) === String(c._id));
                    const cReturns = saleReturns.filter(r => String(r.customer) === String(c._id));
                    return {
                        customer: c.name, channel: c.type,
                        totalSales: cSales.reduce((s, x) => s + actualAmount(x), 0),
                        totalPaid: cSales.reduce((s, x) => s + Number(x.paidAmount || 0), 0),
                        totalReturns: cReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0),
                        outstanding: cSales.reduce((s, x) => s + Number(x.dueAmount || 0), 0),
                    };
                });
                summary = { "Total Outstanding": rows.reduce((s, r) => s + r.outstanding, 0) };
                break;
            }

            case "supplierLedger": {
                const [suppliers, purchases, purchaseReturns] = await Promise.all([Suppliers.find(), Purchases.find(), PurchaseReturns.find()]);
                title = "Supplier Ledger (Complete)";
                columns = [
                    { key: "supplier", label: "Supplier" }, { key: "totalPurchased", label: "Total Purchased", money: true },
                    { key: "totalPaid", label: "Total Paid", money: true }, { key: "totalReturns", label: "Total Returns", money: true },
                    { key: "outstanding", label: "Outstanding", money: true },
                ];
                rows = suppliers.map(s => {
                    const sPurchases = purchases.filter(p => String(p.supplier) === String(s._id));
                    const sReturns = purchaseReturns.filter(r => String(r.supplier) === String(s._id));
                    return {
                        supplier: s.name,
                        totalPurchased: sPurchases.reduce((sum, x) => sum + actualAmount(x), 0),
                        totalPaid: sPurchases.reduce((sum, x) => sum + Number(x.paidAmount || 0), 0),
                        totalReturns: sReturns.reduce((sum, x) => sum + Number(x.totalAmount || 0), 0),
                        outstanding: sPurchases.reduce((sum, x) => sum + Number(x.remainingAmount || 0), 0),
                    };
                });
                summary = { "Total Outstanding": rows.reduce((s, r) => s + r.outstanding, 0) };
                break;
            }

            default:
                return res.status(400).json({ success: false, message: "Invalid report type." });
        }

        return buildReportPdf({ res, title, settings, columns, rows, summary, filtersApplied, isOverview, overviewData });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error."
        });
    }
};