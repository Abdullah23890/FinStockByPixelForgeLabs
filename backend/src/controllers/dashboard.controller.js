import Sales from "../models/Sales.js";
import Purchases from "../models/Purchases.js";
import SaleReturns from "../models/SaleReturn.js";
import PurchaseReturns from "../models/PurchaseReturn.js";
import Expenses from "../models/Expenses.js";
import Customers from "../models/Customers.js";
import Suppliers from "../models/Suppliers.js";

import { calcSaleProfit, calcTotalProfit } from "../utils/profitCalculation.js";

function actualAmount(doc) {
    return Number(doc.netAmount ?? doc.totalAmount ?? 0);
}

export const getDashboard = async (req, res) => {
    try {
        const [sales, purchases, saleReturns, purchaseReturns, expenses, customers, suppliers] = await Promise.all([
            Sales.find().populate("items.batch", "purchasePrice"),
            Purchases.find(),
            SaleReturns.find(),
            PurchaseReturns.find(),
            Expenses.find(),
            Customers.find(),
            Suppliers.find(),
        ]);

        const totalSale = sales.reduce((s, x) => s + actualAmount(x), 0);
        const totalPurchase = purchases.reduce((s, x) => s + actualAmount(x), 0);
        const totalReturnSale = saleReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
        const totalReturnPurchase = purchaseReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
        const totalExpenses = expenses.reduce((s, x) => s + Number(x.amount || 0), 0);
        const totalReceivable = sales.reduce((s, x) => s + Number(x.dueAmount || 0), 0);
        const totalPayable = purchases.reduce((s, x) => s + Number(x.remainingAmount || 0), 0);

        const totalGrossProfit = calcTotalProfit(sales);
        const totalProfit = totalGrossProfit - totalExpenses;

        const now = new Date();
        const monthly = [];

        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

            const mSales = sales.filter((s) => {
                const d = new Date(s.saleDate || s.createdAt);
                return d >= monthStart && d <= monthEnd;
            });
            const mPurchases = purchases.filter((p) => {
                const d = new Date(p.purchaseDate || p.createdAt);
                return d >= monthStart && d <= monthEnd;
            });
            const mExpenses = expenses.filter((e) => {
                const d = new Date(e.date || e.createdAt);
                return d >= monthStart && d <= monthEnd;
            });
            const mSaleReturns = saleReturns.filter((r) => {
                const d = new Date(r.createdAt);
                return d >= monthStart && d <= monthEnd;
            });
            const mPurchaseReturns = purchaseReturns.filter((r) => {
                const d = new Date(r.createdAt);
                return d >= monthStart && d <= monthEnd;
            });

            const mSaleTotal = mSales.reduce((s, x) => s + actualAmount(x), 0);
            const mPurchaseTotal = mPurchases.reduce((s, x) => s + actualAmount(x), 0);
            const mExpenseTotal = mExpenses.reduce((s, x) => s + Number(x.amount || 0), 0);
            const mProfit = calcTotalProfit(mSales) - mExpenseTotal;

            monthly.push({
                month: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                totalSale: mSaleTotal,
                totalPurchase: mPurchaseTotal,
                totalReturnSale: mSaleReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0),
                totalReturnPurchase: mPurchaseReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0),
                totalExpense: mExpenseTotal,
                monthlyProfit: mProfit,
            });
        }

        // ===== Year-over-year growth =====
        const thisYear = now.getFullYear();
        const lastYear = thisYear - 1;
        const thisYearSales = sales.filter((s) => new Date(s.saleDate || s.createdAt).getFullYear() === thisYear).reduce((s, x) => s + actualAmount(x), 0);
        const lastYearSales = sales.filter((s) => new Date(s.saleDate || s.createdAt).getFullYear() === lastYear).reduce((s, x) => s + actualAmount(x), 0);
        const growthPercent = lastYearSales > 0 ? Number((((thisYearSales - lastYearSales) / lastYearSales) * 100).toFixed(1)) : null;

        return res.status(200).json({
            success: true,
            message: "Dashboard fetched successfully.",
            data: {
                totalClients: customers.length,
                totalSuppliers: suppliers.length,
                totalSale,
                totalPurchase,
                totalReturnSale,
                totalReturnPurchase,
                totalExpenses,
                totalReceivable,
                totalPayable,
                totalProfit,
                monthly,
                yearComparison: { thisYear: thisYearSales, lastYear: lastYearSales, growthPercent },
            },
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error." 
        });
    }
};