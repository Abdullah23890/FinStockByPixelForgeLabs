// ===== Helpers =====
function actualAmount(doc) {
  return Number(doc.netAmount ?? doc.totalAmount ?? 0);
}

function inDateRange(date, from, to) {
  if (!date) return true;
  const d = new Date(date).getTime();
  if (from && d < new Date(from).getTime()) return false;
  if (to && d > new Date(to).setHours(23, 59, 59, 999)) return false;
  return true;
}

// ===== 1. Category Report =====
export function buildCategoryReport(categories, products) {
  const rows = categories.map((cat) => {
    const count = products.filter((p) => (p.category?._id || p.category) === cat._id).length;
    return { category: cat.name, totalProducts: count };
  });
  return {
    columns: [{ key: "category", label: "Category" }, { key: "totalProducts", label: "Total Products" }],
    rows,
    summary: { "Total Categories": categories.length, "Total Products": products.length },
  };
}

// ===== 2. Product Report =====
export function buildProductReport(products, batches, filters = {}) {
  let list = products;
  if (filters.category) list = list.filter((p) => (p.category?._id || p.category) === filters.category);

  const rows = list.map((p) => {
    const pBatches = batches.filter((b) => (b.product?._id || b.product) === p._id);
    const totalQty = pBatches.reduce((sum, b) => sum + Number(b.quantity || 0), 0);
    return {
      product: p.name,
      barcode: p.barcode,
      category: p.category?.name || "—",
      totalQty,
      totalBatches: pBatches.length,
    };
  });

  return {
    columns: [
      { key: "product", label: "Product" },
      { key: "barcode", label: "Barcode" },
      { key: "category", label: "Category" },
      { key: "totalQty", label: "Total Qty" },
      { key: "totalBatches", label: "Total Batches" },
    ],
    rows,
    summary: { "Total Products": rows.length },
  };
}

// ===== 3. Supplier Report =====
export function buildSupplierReport(suppliers, purchases, supplierCreditNotes, filters = {}) {
  const rows = suppliers.map((s) => {
    const sPurchases = purchases.filter(
      (p) => (p.supplier?._id || p.supplier) === s._id && inDateRange(p.purchaseDate, filters.from, filters.to)
    );
    const totalPurchases = sPurchases.reduce((sum, p) => sum + actualAmount(p), 0); // ✅ netAmount
    const totalPaid = sPurchases.reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);
    const remaining = sPurchases.reduce((sum, p) => sum + Number(p.remainingAmount || 0), 0);
    const creditNotes = supplierCreditNotes
      .filter((cn) => (cn.supplier?._id || cn.supplier) === s._id && cn.status === "active")
      .reduce((sum, cn) => sum + Number(cn.remainingAmount || 0), 0);

    return { supplier: s.name, contact: s.contactNo || "—", totalPurchases, totalPaid, remaining, creditNotes };
  });

  return {
    columns: [
      { key: "supplier", label: "Supplier" }, { key: "contact", label: "Contact" },
      { key: "totalPurchases", label: "Total Purchases (Net)", money: true },
      { key: "totalPaid", label: "Total Paid", money: true },
      { key: "remaining", label: "Remaining", money: true },
      { key: "creditNotes", label: "Credit Note", money: true },
    ],
    rows,
    summary: { "Total Payable": rows.reduce((s, r) => s + r.remaining, 0), "Total Purchases (Net)": rows.reduce((s, r) => s + r.totalPurchases, 0) },
  };
}

// ===== 4. Customer Report =====
export function buildCustomerReport(customers, sales, creditNotes, filters = {}) {
  let list = customers;
  if (filters.channel) list = list.filter((c) => c.type === filters.channel);

  const rows = list.map((c) => {
    const cSales = sales.filter(
      (s) => (s.customer?._id || s.customer) === c._id && inDateRange(s.saleDate, filters.from, filters.to)
    );
    const totalSales = cSales.reduce((sum, s) => sum + actualAmount(s), 0); // ✅ netAmount
    const totalPaid = cSales.reduce((sum, s) => sum + Number(s.paidAmount || 0), 0);
    const due = cSales.reduce((sum, s) => sum + Number(s.dueAmount || 0), 0);
    const cCreditNotes = creditNotes
      .filter((cn) => (cn.customer?._id || cn.customer) === c._id && cn.status === "active")
      .reduce((sum, cn) => sum + Number(cn.remainingAmount || 0), 0);

    return { customer: c.name, channel: c.type, contact: c.contactNo || "—", totalSales, totalPaid, due, creditNotes: cCreditNotes };
  });

  return {
    columns: [
      { key: "customer", label: "Customer" }, { key: "channel", label: "Channel" }, { key: "contact", label: "Contact" },
      { key: "totalSales", label: "Total Sales (Net)", money: true },
      { key: "totalPaid", label: "Total Paid", money: true },
      { key: "due", label: "Due", money: true },
      { key: "creditNotes", label: "Credit Note", money: true },
    ],
    rows,
    summary: { "Total Receivable": rows.reduce((s, r) => s + r.due, 0), "Total Sales (Net)": rows.reduce((s, r) => s + r.totalSales, 0) },
  };
}

// ===== 5. Expired / Near-Expiry Stock Report =====
export function buildExpiryReport(batches, filters = {}) {
  const days = Number(filters.daysAhead || 0);
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + days);

  const rows = batches
    .filter((b) => b.expiryDate && new Date(b.expiryDate) <= cutoff && Number(b.quantity) > 0)
    .map((b) => ({
      product: b.product?.name || "—",
      batchNo: b.batchNo,
      expiryDate: b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : "—",
      qty: b.quantity,
      status: new Date(b.expiryDate) < now ? "Expired" : "Near Expiry",
    }))
    .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));

  return {
    columns: [
      { key: "product", label: "Product" },
      { key: "batchNo", label: "Batch No" },
      { key: "expiryDate", label: "Expiry Date" },
      { key: "qty", label: "Qty" },
      { key: "status", label: "Status" },
    ],
    rows,
    summary: { "Total Batches": rows.length },
  };
}

// ===== 6. Top 20 Product Sales Report =====
export function buildTopProductsReport(sales, filters = {}) {
  const productMap = new Map();

  for (const sale of sales) {
    if (!inDateRange(sale.saleDate, filters.from, filters.to)) continue;
    for (const item of sale.items || []) {
      const key = item.product?._id || item.product;
      const name = item.product?.name || "—";
      if (!productMap.has(key)) productMap.set(key, { product: name, qtySold: 0, revenue: 0 });
      const entry = productMap.get(key);
      entry.qtySold += Number(item.quantity || 0);
      entry.revenue += Number(item.total || 0);
    }
  }

  const rows = [...productMap.values()]
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 20)
    .map((r, idx) => ({ rank: idx + 1, ...r }));

  return {
    columns: [
      { key: "rank", label: "#" },
      { key: "product", label: "Product" },
      { key: "qtySold", label: "Qty Sold" },
      { key: "revenue", label: "Revenue", money: true },
    ],
    rows,
    summary: { "Total Revenue (Top 20)": rows.reduce((s, r) => s + r.revenue, 0) },
  };
}

// ===== 7. Sales Report =====
export function buildSalesReport(sales, filters = {}) {
  const rows = sales
    .filter((s) => inDateRange(s.saleDate, filters.from, filters.to) && (!filters.channel || s.channel === filters.channel) && (!filters.status || s.status === filters.status))
    .map((s) => ({
      date: s.saleDate ? new Date(s.saleDate).toLocaleDateString() : "—",
      saleNo: s.saleNumber, channel: s.channel, customer: s.customer?.name || "Walk-in",
      total: actualAmount(s), // ✅ netAmount
      paid: s.paidAmount, due: s.dueAmount, status: s.status,
    }));

  return {
    columns: [
      { key: "date", label: "Date" }, { key: "saleNo", label: "Sale No" }, { key: "channel", label: "Channel" },
      { key: "customer", label: "Customer" }, { key: "total", label: "Net Total", money: true },
      { key: "paid", label: "Paid", money: true }, { key: "due", label: "Due", money: true }, { key: "status", label: "Status" },
    ],
    rows,
    summary: { "Total Sales (Net)": rows.reduce((s, r) => s + Number(r.total || 0), 0), "Total Due": rows.reduce((s, r) => s + Number(r.due || 0), 0) },
  };
}

// ===== 8. Purchase Report =====
export function buildPurchaseReport(purchases, filters = {}) {
  const rows = purchases
    .filter((p) => inDateRange(p.purchaseDate, filters.from, filters.to) && (!filters.status || p.status === filters.status))
    .map((p) => ({
      date: p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : "—",
      purchaseNo: p.purchaseNumber, supplier: p.supplier?.name || "—",
      total: actualAmount(p), // ✅ netAmount
      paid: p.paidAmount, remaining: p.remainingAmount, status: p.status,
    }));

  return {
    columns: [
      { key: "date", label: "Date" }, { key: "purchaseNo", label: "Purchase No" }, { key: "supplier", label: "Supplier" },
      { key: "total", label: "Net Total", money: true }, { key: "paid", label: "Paid", money: true },
      { key: "remaining", label: "Remaining", money: true }, { key: "status", label: "Status" },
    ],
    rows,
    summary: { "Total Purchases (Net)": rows.reduce((s, r) => s + Number(r.total || 0), 0), "Total Payable": rows.reduce((s, r) => s + Number(r.remaining || 0), 0) },
  };
}

// ===== 9. Customer Ledger Complete (all customers, summary) =====
export function buildCustomerLedgerReport(customers, sales, saleReturns) {
  const rows = customers.map((c) => {
    const cSales = sales.filter((s) => (s.customer?._id || s.customer) === c._id);
    const cReturns = saleReturns.filter((r) => (r.customer?._id || r.customer) === c._id);
    return {
      customer: c.name, channel: c.type,
      totalSales: cSales.reduce((s, x) => s + actualAmount(x), 0), // ✅ netAmount
      totalPaid: cSales.reduce((s, x) => s + Number(x.paidAmount || 0), 0),
      totalReturns: cReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0),
      outstanding: cSales.reduce((s, x) => s + Number(x.dueAmount || 0), 0),
    };
  });

  return {
    columns: [
      { key: "customer", label: "Customer" }, { key: "channel", label: "Channel" },
      { key: "totalSales", label: "Total Sales (Net)", money: true }, { key: "totalPaid", label: "Total Paid", money: true },
      { key: "totalReturns", label: "Total Returns", money: true }, { key: "outstanding", label: "Outstanding", money: true },
    ],
    rows,
    summary: { "Total Outstanding": rows.reduce((s, r) => s + r.outstanding, 0) },
  };
}

// ===== 10. Supplier Ledger Complete (all suppliers, summary) =====
export function buildSupplierLedgerReport(suppliers, purchases, purchaseReturns) {
  const rows = suppliers.map((s) => {
    const sPurchases = purchases.filter((p) => (p.supplier?._id || p.supplier) === s._id);
    const sReturns = purchaseReturns.filter((r) => (r.supplier?._id || r.supplier) === s._id);
    return {
      supplier: s.name,
      totalPurchased: sPurchases.reduce((sum, x) => sum + actualAmount(x), 0), // ✅ netAmount
      totalPaid: sPurchases.reduce((sum, x) => sum + Number(x.paidAmount || 0), 0),
      totalReturns: sReturns.reduce((sum, x) => sum + Number(x.totalAmount || 0), 0),
      outstanding: sPurchases.reduce((sum, x) => sum + Number(x.remainingAmount || 0), 0),
    };
  });

  return {
    columns: [
      { key: "supplier", label: "Supplier" }, { key: "totalPurchased", label: "Total Purchased (Net)", money: true },
      { key: "totalPaid", label: "Total Paid", money: true }, { key: "totalReturns", label: "Total Returns", money: true },
      { key: "outstanding", label: "Outstanding", money: true },
    ],
    rows,
    summary: { "Total Outstanding": rows.reduce((s, r) => s + r.outstanding, 0) },
  };
}

// ===== Profit Helpers =====
export function calcSaleProfit(sale) {
  let itemsProfit = 0;
  let totalQty = 0;
  let returnedQty = 0;

  for (const item of sale.items || []) {
    const qty = Number(item.quantity || 0);
    const retQty = Number(item.returnQuantity || 0);
    const purchasePrice = Number(item.purchasePrice ?? item.batch?.purchasePrice ?? 0);
    const unitPrice = Number(item.unitPrice || 0);
    const itemDiscount = Number(item.discount || 0);

    const itemProfit = item.profit != null
      ? Number(item.profit)
      : ((unitPrice - purchasePrice) * qty - itemDiscount);

    const returnedProfit = qty > 0 ? (itemProfit / qty) * retQty : 0;
    itemsProfit += itemProfit - returnedProfit;

    totalQty += qty;
    returnedQty += retQty;
  }

  const billDiscount = Number(sale.discount || 0);
  const remainingRatio = totalQty > 0 ? Math.max((totalQty - returnedQty) / totalQty, 0) : 1;
  const effectiveBillDiscount = billDiscount * remainingRatio;

  return itemsProfit - effectiveBillDiscount;
}

export function calcTotalProfit(sales = []) {
  return sales.reduce((sum, sale) => sum + calcSaleProfit(sale), 0);
}

// ===== 11. Overview Report (summary cards, no table) =====
export function buildOverviewReport(data) {
  const { sales = [], purchases = [], expenses = [], supplierCreditNotes = [], creditNotes = [], saleReturns = [], purchaseReturns = [] } = data;

  const totalSale = sales.reduce((s, x) => s + actualAmount(x), 0); // ✅ netAmount
  const totalPurchase = purchases.reduce((s, x) => s + actualAmount(x), 0); // ✅ netAmount
  const totalReturnSale = saleReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
  const totalReturnPurchase = purchaseReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
  const totalReceivable = sales.reduce((s, x) => s + Number(x.dueAmount || 0), 0);
  const totalPayable = purchases.reduce((s, x) => s + Number(x.remainingAmount || 0), 0);

  const totalCreditNoteSupplier = supplierCreditNotes.filter((cn) => cn.status === "active").reduce((s, cn) => s + Number(cn.remainingAmount || 0), 0);
  const totalCreditNoteCustomer = creditNotes.filter((cn) => cn.status === "active").reduce((s, cn) => s + Number(cn.remainingAmount || 0), 0);
  const totalExpense = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);

  const grossProfit = calcTotalProfit(sales);

  return {
    "Total Sale (Net)": totalSale,
    "Total Purchase (Net)": totalPurchase,
    "Total Return Sale": totalReturnSale,
    "Total Return Purchase": totalReturnPurchase,
    "Total Receivable": totalReceivable,
    "Total Payable": totalPayable,
    "Supplier Credit Notes": totalCreditNoteSupplier,
    "Customer Credit Notes": totalCreditNoteCustomer,
    "Total Expense": totalExpense,
    "Net Profit": grossProfit - totalExpense,
  };
}

// ===== 12. Today's Report (summary cards + table of products sold today) =====
export function buildTodayReport(data) {
  const { sales = [], purchases = [], expenses = [], saleReturns = [], purchaseReturns = [] } = data;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();

  const isToday = (date) => {
    if (!date) return false;
    const t = new Date(date).getTime();
    return t >= todayStart && t <= todayEnd;
  };

  const todaySales = sales.filter((s) => isToday(s.saleDate || s.createdAt));
  const todayPurchases = purchases.filter((p) => isToday(p.purchaseDate || p.createdAt));
  const todayExpenses = expenses.filter((e) => isToday(e.date || e.createdAt));
  const todaySaleReturns = saleReturns.filter((r) => isToday(r.createdAt));
  const todayPurchaseReturns = purchaseReturns.filter((r) => isToday(r.createdAt));

  const totalSale = todaySales.reduce((s, x) => s + actualAmount(x), 0);
  const totalPurchase = todayPurchases.reduce((s, x) => s + actualAmount(x), 0);
  const totalReturnSale = todaySaleReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
  const totalReturnPurchase = todayPurchaseReturns.reduce((s, x) => s + Number(x.totalAmount || 0), 0);
  const totalExpense = todayExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const totalReceivable = todaySales.reduce((s, x) => s + Number(x.dueAmount || 0), 0);
  const totalPayable = todayPurchases.reduce((s, x) => s + Number(x.remainingAmount || 0), 0);

  const todayGrossProfit = calcTotalProfit(todaySales);
  const todayProfit = todayGrossProfit - totalExpense;

  const overviewData = {
    "Total Sale": totalSale,
    "Total Purchase": totalPurchase,
    "Total Return Sale": totalReturnSale,
    "Total Return Purchase": totalReturnPurchase,
    "Total Receivable": totalReceivable,
    "Total Payable": totalPayable,
    "Today's Expense": totalExpense,
    "Today's Profit": todayProfit,
  };

  const productMap = new Map();
  for (const sale of todaySales) {
    for (const item of sale.items || []) {
      const key = String(item.product?._id || item.product);
      const name = item.product?.name || "—";
      if (!productMap.has(key)) productMap.set(key, { product: name, qtySold: 0, revenue: 0 });
      const e = productMap.get(key);
      e.qtySold += Number(item.quantity || 0);
      e.revenue += Number(item.total || 0);
    }
  }

  const columns = [
    { key: "product", label: "Product" },
    { key: "qtySold", label: "Qty Sold" },
    { key: "revenue", label: "Revenue", money: true },
  ];

  const rows = [...productMap.values()].sort((a, b) => b.qtySold - a.qtySold);

  const summary = {
    "Total Sales Count": todaySales.length,
    "Paid": todaySales.filter((s) => s.status === "paid").length,
    "Partial": todaySales.filter((s) => s.status === "partial").length,
    "Unpaid": todaySales.filter((s) => s.status === "unPaid").length,
  };

  return {
    isOverview: true,
    overviewData,
    columns,
    rows,
    summary,
  };
}