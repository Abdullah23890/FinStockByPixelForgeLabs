import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import TrendLineChart from "../Components/TrendLineChart";
import { getDashboard } from "../Api/dashboard.api.js";
import "../Css/Dashboard.css";

const fmtMoney = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data.data))
      .catch((err) => console.error("Failed to load dashboard:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <MainContent
        pageTitle="Dashboard"
        pageSubtitle="Loading..."
        sections={[{ id: "loading", title: null, content: <p>Loading dashboard...</p> }]}
      />
    );
  }

  const growth = data?.yearComparison?.growthPercent;
  const isUp = growth !== null && growth >= 0;

  const CARDS = [
    { label: "Total Sale", value: fmtMoney(data?.totalSale), tone: "green" },
    { label: "Total Purchase", value: fmtMoney(data?.totalPurchase), tone: "blue" },
    { label: "Return Sale", value: fmtMoney(data?.totalReturnSale), tone: "ember" },
    { label: "Return Purchase", value: fmtMoney(data?.totalReturnPurchase), tone: "ember" },
    { label: "Receivable", value: fmtMoney(data?.totalReceivable), tone: "violet" },
    { label: "Payable", value: fmtMoney(data?.totalPayable), tone: "violet" },
    { label: "Total Expenses", value: fmtMoney(data?.totalExpenses), tone: "red" },
    { label: "Total Profit", value: fmtMoney(data?.totalProfit), tone: data?.totalProfit >= 0 ? "green" : "red" },
  ];

  return (
    <MainContent
      pageTitle="Dashboard"
      pageSubtitle="Live overview of sales, purchases, and profitability."
      sections={[
        {
          id: "dashboard",
          title: null,
          content: (
            <div className="pfl-dash">
              {/* ===== Summary cards ===== */}
              <div className="pfl-dash__cards">
                {CARDS.map((c) => (
                  <div className={`pfl-dash__card pfl-dash__card--${c.tone}`} key={c.label}>
                    <div className="pfl-dash__card-top">
                      <span className="pfl-dash__card-label">{c.label}</span>
                    </div>
                    <div className="pfl-dash__card-value">{c.value}</div>
                  </div>
                ))}
              </div>

              {/* ===== Trend chart + Year comparison ===== */}
              <div className="pfl-dash__row">
                <div className="pfl-dash__panel">
                  <div className="pfl-dash__panel-head">
                    <span className="pfl-dash__panel-title">Monthly Trend (Last 6 Months)</span>
                    <div className="pfl-dash__legend">
                      <span><i className="pfl-dash__dot" style={{ background: "#1F9D5A" }} /> Sale</span>
                      <span><i className="pfl-dash__dot" style={{ background: "#E3453B" }} /> Expense</span>
                      <span><i className="pfl-dash__dot" style={{ background: "#3C7DD9" }} /> Profit</span>
                    </div>
                  </div>
                  <TrendLineChart
                    data={data?.monthly || []}
                    series={[
                      { key: "totalSale", color: "#1F9D5A" },
                      { key: "totalExpense", color: "#E3453B" },
                      { key: "monthlyProfit", color: "#3C7DD9" },
                    ]}
                  />
                </div>

                <div className="pfl-dash__panel">
                  <div className="pfl-dash__panel-head">
                    <span className="pfl-dash__panel-title">Year-over-Year</span>
                  </div>
                  <div className="pfl-dash__year-compare">
                    <div className={`pfl-dash__growth-badge ${isUp ? "is-up" : "is-down"}`}>
                      {growth !== null ? `${isUp ? "+" : ""}${growth}%` : "—"}
                    </div>
                    <div className="pfl-dash__growth-sub">vs. same period last year</div>

                    <div>
                      <div className="pfl-dash__year-row">
                        <span className="pfl-dash__year-label">This Year</span>
                        <span className="pfl-dash__year-value">{fmtMoney(data?.yearComparison?.thisYear)}</span>
                      </div>
                      <div className="pfl-dash__year-row">
                        <span className="pfl-dash__year-label">Last Year</span>
                        <span className="pfl-dash__year-value">{fmtMoney(data?.yearComparison?.lastYear)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===== Monthly breakdown table ===== */}
              <div className="pfl-dash__panel table-responsive">
                <div className="pfl-dash__panel-head">
                  <span className="pfl-dash__panel-title">Monthly Breakdown</span>
                </div>
                <table className="pfl-dash__mtable">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Sale</th>
                      <th>Purchase</th>
                      <th>Return (S)</th>
                      <th>Return (P)</th>
                      <th>Expense</th>
                      <th>Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.monthly?.map((m) => (
                      <tr key={m.month}>
                        <td>{m.month}</td>
                        <td>{fmtMoney(m.totalSale)}</td>
                        <td>{fmtMoney(m.totalPurchase)}</td>
                        <td>{fmtMoney(m.totalReturnSale)}</td>
                        <td>{fmtMoney(m.totalReturnPurchase)}</td>
                        <td>{fmtMoney(m.totalExpense)}</td>
                        <td className={m.monthlyProfit >= 0 ? "profit-pos" : "profit-neg"}>
                          {fmtMoney(m.monthlyProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ),
        },
      ]}
    />
  );
}
