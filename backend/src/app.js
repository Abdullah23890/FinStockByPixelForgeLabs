import express from "express";
import cors from "cors";
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import dashboardRoute from "./routes/dashboard.route.js";
import categoryRoute from "./routes/category.route.js";
import productRoute from "./routes/product.route.js";
import batchRoute from "./routes/batch.route.js";
import supplierRoute from "./routes/suplier.route.js";
import purchaseRoute from "./routes/purchase.route.js";
import purchaseReturnRoute from "./routes/purchaseReturn.route.js";
import supplierCreditNoteRoute from "./routes/supplierCreditNote.route.js";
import customerRoute from "./routes/customer.route.js";
import saleRoute from "./routes/sale.route.js";
import saleReturnRoute from "./routes/saleReturn.route.js";
import creditNoteRoute from "./routes/creditNote.route.js";
import expenseRoute from "./routes/expense.route.js";
import stockAlertRoute from "./routes/stockAlert.route.js";
import reportRoute from "./routes/report.route.js";
import settingRoute from "./routes/setting.route.js";
import developerRoute from "./routes/developer.route.js";

const app = express();
const api = process.env.FRONTEND_URL

app.use(
    cors({
        api,
        credentials: true
    })
)

app.use(express.json());

app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/dashboard", dashboardRoute);
app.use("/api/categories", categoryRoute);
app.use("/api/products", productRoute);
app.use("/api/batches", batchRoute);
app.use("/api/suppliers", supplierRoute);
app.use("/api/purchases", purchaseRoute);
app.use("/api/supplier/purchaseReturn", purchaseReturnRoute);
app.use("/api/supplier/creditNotes", supplierCreditNoteRoute);
app.use("/api/customers", customerRoute);
app.use("/api/sales", saleRoute);
app.use("/api/customer/saleReturn", saleReturnRoute);
app.use("/api/customer/creditNotes", creditNoteRoute);
app.use("/api/expenses", expenseRoute);
app.use("/api/stockAlerts", stockAlertRoute);
app.use("/api/reports", reportRoute);
app.use("/api/settings", settingRoute);
app.use("/api/developer", developerRoute);

export default app;