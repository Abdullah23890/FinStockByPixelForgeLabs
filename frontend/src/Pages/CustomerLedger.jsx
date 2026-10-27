import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainContent from "../Components/MainContent";
import SidePanel from "../Components/SidePanel";
import AddSalePaymentForm from "../Components/AddSalePaymentForm";
import SaleView from "../Components/SaleView";
import SaleReturnView from "../Components/SaleReturnView";
import CreditNoteView from "../Components/CreditNoteView";
import "../Css/CustomerLedger.css";

import { 
  getCreditNotesByCustomer 
} from "../Api/creditNote.api.js";

import { 
  getCustomerLedger 
} from "../Api/customer.api.js";

import { 
  addSalePayment, 
  getSaleById 
} from "../Api/sale.api.js";

const TABS = ["Sales", "Payments", "Returns", "Credit Notes"];

export default function CustomerLedger() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Sales");

  // Add payment
  const [payingSale, setPayingSale] = useState(null);
  const [payingSubmitting, setPayingSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // View a sale (fetched fully populated on demand)
  const [viewSale, setViewSale] = useState(null);
  const [viewSaleLoading, setViewSaleLoading] = useState(false);

  // View a return
  const [viewReturn, setViewReturn] = useState(null);

  // View a credit note
  const [viewCreditNote, setViewCreditNote] = useState(null);

  const [creditNotes, setCreditNotes] = useState([]);

  async function loadLedger() {
    setLoading(true);
    setError("");
    try {
      const res = await getCustomerLedger(id);
      setData(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customer ledger.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLedger();
  }, [id]);

  useEffect(() => {
    if (id) {
      getCreditNotesByCustomer(id)
        .then((res) => setCreditNotes(res.data.data || []))
        .catch((err) => console.error("Failed to load credit notes:", err));
    }
  }, [id]);

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString() : "—";
  }

  function fmtMoney(n) {
    return `PKR ${Number(n || 0).toLocaleString()}`;
  }

  function openAddPayment(sale) {
    setPaymentError("");
    setPayingSale(sale);
  }

  function closeAddPayment() {
    setPayingSale(null);
    setPaymentError("");
  }

  async function handleAddPayment(saleId, paymentData) {
    setPayingSubmitting(true);
    setPaymentError("");
    try {
      await addSalePayment(saleId, paymentData);
      closeAddPayment();
      loadLedger();
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to add payment.");
    } finally {
      setPayingSubmitting(false);
    }
  }

  async function openViewSale(sale) {
    setViewSaleLoading(true);
    setViewSale(null);
    try {
      const res = await getSaleById(sale._id);
      setViewSale(res.data.data);
    } catch (err) {
      console.error("Failed to load sale:", err);
    } finally {
      setViewSaleLoading(false);
    }
  }

  function closeViewSale() {
    setViewSale(null);
  }

  function openViewReturn(ret) {
    setViewReturn(ret);
  }

  function closeViewReturn() {
    setViewReturn(null);
  }

  function openViewCreditNote(note) {
    setViewCreditNote(note);
  }

  function closeViewCreditNote() {
    setViewCreditNote(null);
  }

  if (loading) {
    return (
      <MainContent
        pageTitle="Customer Ledger"
        pageSubtitle="Loading..."
        sections={[{ id: "loading", title: null, content: <p>Loading customer ledger...</p> }]}
      />
    );
  }

  if (error || !data) {
    return (
      <MainContent
        pageTitle="Customer Ledger"
        pageSubtitle="Something went wrong."
        sections={[
          {
            id: "error",
            title: null,
            content: (
              <div className="pfl-custledger__error">
                {error || "Customer not found."}
                <button className="pfl-custledger__back-btn" onClick={() => navigate("/customer")}>
                  Back to Customers
                </button>
              </div>
            ),
          },
        ]}
      />
    );
  }

  const { customer, entries = [], sales = [], returns = [], summary = {} } = data;

  const paymentEntries = entries.filter((e) => e.type === "payment");

  return (
    <>
      <MainContent
        pageTitle="Customer Ledger"
        pageSubtitle={`Full sale, payment, and return history for ${customer?.name || "this customer"}.`}
        sections={[
          {
            id: "customer-ledger",
            title: null,
            content: (
              <div className="pfl-custledger">
                <div className="pfl-custledger__customer-card">
                  <div className="pfl-custledger__customer-info">
                    <h3>{customer?.name}</h3>
                    <span>{customer?.contactNo || "—"}</span>
                    <span>{customer?.address || "—"}</span>
                  </div>
                  <button className="pfl-custledger__back-btn" onClick={() => navigate("/customer")}>
                    ← Back to Customers
                  </button>
                </div>

                <div className="pfl-custledger__summary-grid">
                  <SummaryCard label="Total Sales" value={fmtMoney(summary.totalSales)} />
                  <SummaryCard label="Total Paid" value={fmtMoney(summary.totalPaid)} tone="green" />
                  <SummaryCard label="Total Returns" value={fmtMoney(summary.totalReturns)} tone="ember" />
                  <SummaryCard label="Outstanding Balance" value={fmtMoney(summary.outstanding)} tone="red" />
                </div>

                <div className="pfl-custledger__tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      className={`pfl-custledger__tab ${activeTab === tab ? "is-active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="pfl-custledger__tab-content">
                  {activeTab === "Sales" && (
                    <SalesTab sales={sales} fmtDate={fmtDate} fmtMoney={fmtMoney} onAddPayment={openAddPayment} onView={openViewSale} />
                  )}
                  {activeTab === "Payments" && (
                    <PaymentsTab sales={sales} entries={paymentEntries} fmtDate={fmtDate} fmtMoney={fmtMoney} />
                  )}
                  {activeTab === "Returns" && (
                    <ReturnsTab returns={returns} fmtDate={fmtDate} fmtMoney={fmtMoney} onView={openViewReturn} />
                  )}
                  {activeTab === "Credit Notes" && (
                    <CreditNotesTab notes={creditNotes} fmtDate={fmtDate} fmtMoney={fmtMoney} onView={openViewCreditNote} />
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />

      <SidePanel open={payingSale !== null} onClose={closeAddPayment} title="Add Payment">
        <AddSalePaymentForm
          sale={payingSale}
          onSubmit={handleAddPayment}
          onCancel={closeAddPayment}
          submitting={payingSubmitting}
          serverError={paymentError}
        />
      </SidePanel>

      <SidePanel open={viewSale !== null || viewSaleLoading} onClose={closeViewSale} title="Sale">
        {viewSaleLoading ? <p>Loading sale details...</p> : <SaleView sale={viewSale} onClose={closeViewSale} onAddPayment={openAddPayment} />}
      </SidePanel>

      <SidePanel open={viewReturn !== null} onClose={closeViewReturn} title="Sale Return">
        <SaleReturnView saleReturn={viewReturn} onClose={closeViewReturn} />
      </SidePanel>

      <SidePanel open={viewCreditNote !== null} onClose={closeViewCreditNote} title="Credit Note">
        <CreditNoteView creditNote={viewCreditNote} onClose={closeViewCreditNote} />
      </SidePanel>
    </>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className={`pfl-custledger__card ${tone ? `pfl-custledger__card--${tone}` : ""}`}>
      <span className="pfl-custledger__card-label">{label}</span>
      <span className="pfl-custledger__card-value">{value}</span>
    </div>
  );
}

function SalesTab({ sales, fmtDate, fmtMoney, onAddPayment, onView }) {
  if (!sales.length) return <EmptyState text="No sales recorded for this customer yet." />;

  return (
    <div className="pfl-custledger__table-wrap">
      <table className="pfl-custledger__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Sale No</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Due</th>
            <th>Status</th>
            <th className="pfl-custledger__col-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s._id}>
              <td>{fmtDate(s.saleDate || s.createdAt)}</td>
              <td className="pfl-custledger__cell-strong">{s.saleNumber}</td>
              <td>{fmtMoney(s.totalAmount)}</td>
              <td>{fmtMoney(s.paidAmount)}</td>
              <td className={s.dueAmount > 0 ? "pfl-custledger__due-cell" : ""}>{fmtMoney(s.dueAmount)}</td>
              <td>
                <span className={`pfl-custledger__status pfl-custledger__status--${s.status}`}>{s.status}</span>
              </td>
              <td className="pfl-custledger__col-right pfl-custledger__actions-cell">
                <button className="pfl-custledger__view-btn" onClick={() => onView?.(s)}>
                  View
                </button>
                {s.dueAmount > 0 && (
                  <button className="pfl-custledger__pay-btn" onClick={() => onAddPayment?.(s)}>
                    Add Payment
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


function PaymentsTab({ sales, entries, fmtDate, fmtMoney }) {
  const [saleFilter, setSaleFilter] = useState("all");

  const saleNumbers = useMemo(
    () => [...new Set(entries.map((e) => e.reference))].filter(Boolean),
    [entries]
  );

  const filtered = useMemo(
    () => (saleFilter === "all" ? entries : entries.filter((e) => e.reference === saleFilter)),
    [entries, saleFilter]
  );

  const selectedSale = useMemo(
    () => (saleFilter !== "all" ? sales.find((s) => s.saleNumber === saleFilter) : null),
    [sales, saleFilter]
  );

  if (!entries.length) return <EmptyState text="No payments recorded for this customer yet." />;

  return (
    <div>
      <div className="pfl-custledger__filter-row">
        <label>Filter by Sale</label>
        <select className="pfl-custledger__filter-select" value={saleFilter} onChange={(e) => setSaleFilter(e.target.value)}>
          <option value="all">All Sales</option>
          {saleNumbers.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {selectedSale && (
        <div className="pfl-custledger__mini-summary">
          <div>
            <label>Total</label>
            <span>{fmtMoney(selectedSale.totalAmount)}</span>
          </div>
          <div>
            <label>Paid</label>
            <span className="pfl-custledger__mini-paid">{fmtMoney(selectedSale.paidAmount)}</span>
          </div>
          <div>
            <label>Remaining</label>
            <span className="pfl-custledger__mini-remaining">{fmtMoney(selectedSale.dueAmount)}</span>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState text="No payments found for this sale." />
      ) : (
        <div className="pfl-custledger__table-wrap">
          <table className="pfl-custledger__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Against Sale</th>
                <th>Method</th>
                <th>Description</th>
                <th className="pfl-custledger__col-right">Amount</th>
                {saleFilter === "all" && <th className="pfl-custledger__col-right">Balance (Overall)</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, idx) => (
                <tr key={idx}>
                  <td>{fmtDate(e.date)}</td>
                  <td className="pfl-custledger__cell-strong">{e.reference || "General payment"}</td>
                  <td>{e.method || "—"}</td>
                  <td>{e.description || "—"}</td>
                  <td className="pfl-custledger__col-right">{fmtMoney(e.amount)}</td>
                  {saleFilter === "all" && (
                    <td className="pfl-custledger__col-right pfl-custledger__balance-cell">{fmtMoney(e.runningBalance)}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ReturnsTab({ returns, fmtDate, fmtMoney, onView }) {
  if (!returns.length) return <EmptyState text="No returns recorded for this customer yet." />;

  return (
    <div className="pfl-custledger__table-wrap">
      <table className="pfl-custledger__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Return No</th>
            <th>Against Sale</th>
            <th>Items</th>
            <th>Reason</th>
            <th>Refund Method</th>
            <th className="pfl-custledger__col-right">Amount</th>
            <th className="pfl-custledger__col-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((r) => (
            <tr key={r._id}>
              <td>{fmtDate(r.createdAt)}</td>
              <td className="pfl-custledger__cell-strong">{r.returnNo}</td>
              <td>{r.sale?.saleNumber || "—"}</td>
              <td>{(r.items || []).map((it) => it.product?.name).filter(Boolean).join(", ") || "—"}</td>
              <td>{r.reason || "—"}</td>
              <td>{r.refundMethod || "—"}</td>
              <td className="pfl-custledger__col-right">{fmtMoney(r.totalAmount)}</td>
              <td className="pfl-custledger__col-right">
                <button className="pfl-custledger__view-btn" onClick={() => onView?.(r)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CreditNotesTab({ notes, fmtDate, fmtMoney, onView }) {
  if (!notes.length) return <EmptyState text="No credit notes issued for this customer yet." />;

  return (
    <div className="pfl-custledger__table-wrap">
      <table className="pfl-custledger__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Credit Note #</th>
            <th>Against Sale</th>
            <th>Amount</th>
            <th>Used</th>
            <th>Remaining</th>
            <th>Status</th>
            <th className="pfl-custledger__col-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n._id}>
              <td>{fmtDate(n.createdAt)}</td>
              <td className="pfl-custledger__cell-strong">{n.creditNoteNumber}</td>
              <td>{n.sale?.saleNumber || "—"}</td>
              <td>{fmtMoney(n.amount)}</td>
              <td>{fmtMoney(n.usedAmount)}</td>
              <td className={n.remainingAmount > 0 ? "pfl-custledger__due-cell" : ""}>{fmtMoney(n.remainingAmount)}</td>
              <td>
                <span
                  className={`pfl-custledger__status pfl-custledger__status--${
                    n.status === "active" ? "partial" : n.status === "used" ? "paid" : "unPaid"
                  }`}
                >
                  {n.status}
                </span>
              </td>
              <td className="pfl-custledger__col-right">
                <button className="pfl-custledger__view-btn" onClick={() => onView?.(n)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text }) {
  return <div className="pfl-custledger__empty">{text}</div>;
}