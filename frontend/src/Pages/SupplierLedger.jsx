import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainContent from "../Components/MainContent";
import SidePanel from "../Components/SidePanel";
import AddPurchasePaymentForm from "../Components/AddPurchasePaymentForm";
import PurchaseView from "../Components/PurchaseView";
import PurchaseReturnView from "../Components/PurchaseReturnView";
import SupplierCreditNoteView from "../Components/SupplierCreditNoteView";
import "../Css/SupplierLedger.css";

import { 
  getSupplierLedger 
} from "../Api/supplier.api.js";

import { 
  addPurchasePayment, 
  getPurchaseById 
} from "../Api/purchase.api.js";

import { 
  getSupplierCreditNotesBySupplier 
} from "../Api/supplierCreditNote.api.js";

const TABS = ["Purchases", "Payments", "Returns", "Credit Notes"];

export default function SupplierLedger() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Purchases");

  // Add payment
  const [payingPurchase, setPayingPurchase] = useState(null);
  const [payingSubmitting, setPayingSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // View a purchase
  const [viewPurchase, setViewPurchase] = useState(null);
  const [viewPurchaseLoading, setViewPurchaseLoading] = useState(false);

  // View a return
  const [viewReturn, setViewReturn] = useState(null);

  // View a credit note
  const [viewCreditNote, setViewCreditNote] = useState(null);
  const [creditNotes, setCreditNotes] = useState([]);

  async function loadLedger() {
    setLoading(true);
    setError("");
    try {
      const res = await getSupplierLedger(id);
      setData(res.data.data || res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load supplier ledger.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLedger();
  }, [id]);

  useEffect(() => {
    if (id) {
      getSupplierCreditNotesBySupplier(id)
        .then((res) => setCreditNotes(res.data.data || []))
        .catch((err) => console.error("Failed to load supplier credit notes:", err));
    }
  }, [id]);

  function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString() : "—";
  }

  function fmtMoney(n) {
    return `PKR ${Number(n || 0).toLocaleString()}`;
  }

  function openAddPayment(purchase) {
    setPaymentError("");
    setPayingPurchase(purchase);
  }

  function closeAddPayment() {
    setPayingPurchase(null);
    setPaymentError("");
  }

  async function handleAddPayment(purchaseId, paymentData) {
    setPayingSubmitting(true);
    setPaymentError("");
    try {
      await addPurchasePayment(purchaseId, paymentData);
      closeAddPayment();
      loadLedger();
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to add payment.");
    } finally {
      setPayingSubmitting(false);
    }
  }

  async function openViewPurchase(purchase) {
    setViewPurchaseLoading(true);
    setViewPurchase(null);
    try {
      const res = await getPurchaseById(purchase._id);
      setViewPurchase(res.data.data);
    } catch (err) {
      console.error("Failed to load purchase:", err);
    } finally {
      setViewPurchaseLoading(false);
    }
  }

  function closeViewPurchase() {
    setViewPurchase(null);
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
        pageTitle="Supplier Ledger"
        pageSubtitle="Loading..."
        sections={[{ id: "loading", title: null, content: <p>Loading supplier ledger...</p> }]}
      />
    );
  }

  if (error || !data) {
    return (
      <MainContent
        pageTitle="Supplier Ledger"
        pageSubtitle="Something went wrong."
        sections={[
          {
            id: "error",
            title: null,
            content: (
              <div className="pfl-supledger__error">
                {error || "Supplier not found."}
                <button className="pfl-supledger__back-btn" onClick={() => navigate("/supplier")}>
                  Back to Suppliers
                </button>
              </div>
            ),
          },
        ]}
      />
    );
  }

  const { supplier, entries = [], purchases = [], returns = [], summary = {} } = data;

  const paymentEntries = entries.filter((e) => e.type === "payment");

  return (
    <>
      <MainContent
        pageTitle="Supplier Ledger"
        pageSubtitle={`Full purchase, payment, and return history for ${supplier?.name || "this supplier"}.`}
        sections={[
          {
            id: "supplier-ledger",
            title: null,
            content: (
              <div className="pfl-supledger">
                <div className="pfl-supledger__supplier-card">
                  <div className="pfl-supledger__supplier-info">
                    <h3>{supplier?.name}</h3>
                    <span>{supplier?.contactNo || "—"}</span>
                    <span>{supplier?.address || "—"}</span>
                  </div>
                  <button className="pfl-supledger__back-btn" onClick={() => navigate("/supplier")}>
                    ← Back to Suppliers
                  </button>
                </div>

                <div className="pfl-supledger__summary-grid">
                  <SummaryCard label="Total Purchased" value={fmtMoney(summary.totalPurchased)} />
                  <SummaryCard label="Total Paid" value={fmtMoney(summary.totalPaid)} tone="green" />
                  <SummaryCard label="Total Returns" value={fmtMoney(summary.totalReturns)} tone="ember" />
                  <SummaryCard label="Outstanding Payable" value={fmtMoney(summary.outstanding)} tone="red" />
                </div>

                <div className="pfl-supledger__tabs">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      className={`pfl-supledger__tab ${activeTab === tab ? "is-active" : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="pfl-supledger__tab-content">
                  {activeTab === "Purchases" && (
                    <PurchasesTab purchases={purchases} fmtDate={fmtDate} fmtMoney={fmtMoney} onAddPayment={openAddPayment} onView={openViewPurchase} />
                  )}
                  {activeTab === "Payments" && (
                    <PaymentsTab purchases={purchases} entries={paymentEntries} fmtDate={fmtDate} fmtMoney={fmtMoney} />
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

      <SidePanel open={payingPurchase !== null} onClose={closeAddPayment} title="Add Payment">
        <AddPurchasePaymentForm
          purchase={payingPurchase}
          onSubmit={handleAddPayment}
          onCancel={closeAddPayment}
          submitting={payingSubmitting}
          serverError={paymentError}
        />
      </SidePanel>

      <SidePanel open={viewPurchase !== null || viewPurchaseLoading} onClose={closeViewPurchase} title="Purchase">
        {viewPurchaseLoading ? (
          <p>Loading purchase details...</p>
        ) : (
          <PurchaseView purchase={viewPurchase} onClose={closeViewPurchase} onAddPayment={openAddPayment} />
        )}
      </SidePanel>

      <SidePanel open={viewReturn !== null} onClose={closeViewReturn} title="Purchase Return">
        <PurchaseReturnView purchaseReturn={viewReturn} onClose={closeViewReturn} />
      </SidePanel>

      <SidePanel open={viewCreditNote !== null} onClose={closeViewCreditNote} title="Supplier Credit Note">
        <SupplierCreditNoteView creditNote={viewCreditNote} onClose={closeViewCreditNote} />
      </SidePanel>
    </>
  );
}

function SummaryCard({ label, value, tone }) {
  return (
    <div className={`pfl-supledger__card ${tone ? `pfl-supledger__card--${tone}` : ""}`}>
      <span className="pfl-supledger__card-label">{label}</span>
      <span className="pfl-supledger__card-value">{value}</span>
    </div>
  );
}

function PurchasesTab({ purchases, fmtDate, fmtMoney, onAddPayment, onView }) {
  if (!purchases.length) return <EmptyState text="No purchases recorded for this supplier yet." />;

  return (
    <div className="pfl-supledger__table-wrap">
      <table className="pfl-supledger__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Purchase No</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Remaining</th>
            <th>Status</th>
            <th className="pfl-supledger__col-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p._id}>
              <td>{fmtDate(p.purchaseDate || p.createdAt)}</td>
              <td className="pfl-supledger__cell-strong">{p.purchaseNumber}</td>
              <td>{fmtMoney(p.totalAmount)}</td>
              <td>{fmtMoney(p.paidAmount)}</td>
              <td className={p.remainingAmount > 0 ? "pfl-supledger__due-cell" : ""}>{fmtMoney(p.remainingAmount)}</td>
              <td>
                <span className={`pfl-supledger__status pfl-supledger__status--${p.status}`}>{p.status}</span>
              </td>
              <td className="pfl-supledger__col-right pfl-supledger__actions-cell">
                <button className="pfl-supledger__view-btn" onClick={() => onView?.(p)}>
                  View
                </button>
                {p.remainingAmount > 0 && (
                  <button className="pfl-supledger__pay-btn" onClick={() => onAddPayment?.(p)}>
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

function PaymentsTab({ purchases, entries, fmtDate, fmtMoney }) {
  const [purchaseFilter, setPurchaseFilter] = useState("all");

  const purchaseNumbers = useMemo(
    () => [...new Set(entries.map((e) => e.reference))].filter(Boolean),
    [entries]
  );

  const filtered = useMemo(
    () => (purchaseFilter === "all" ? entries : entries.filter((e) => e.reference === purchaseFilter)),
    [entries, purchaseFilter]
  );

  const selectedPurchase = useMemo(
    () => (purchaseFilter !== "all" ? purchases.find((p) => p.purchaseNumber === purchaseFilter) : null),
    [purchases, purchaseFilter]
  );

  if (!entries.length) return <EmptyState text="No payments recorded for this supplier yet." />;

  return (
    <div>
      <div className="pfl-supledger__filter-row">
        <label>Filter by Purchase</label>
        <select className="pfl-supledger__filter-select" value={purchaseFilter} onChange={(e) => setPurchaseFilter(e.target.value)}>
          <option value="all">All Purchases</option>
          {purchaseNumbers.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>

      {selectedPurchase && (
        <div className="pfl-supledger__mini-summary">
          <div>
            <label>Total</label>
            <span>{fmtMoney(selectedPurchase.totalAmount)}</span>
          </div>
          <div>
            <label>Paid</label>
            <span className="pfl-supledger__mini-paid">{fmtMoney(selectedPurchase.paidAmount)}</span>
          </div>
          <div>
            <label>Remaining</label>
            <span className="pfl-supledger__mini-remaining">{fmtMoney(selectedPurchase.remainingAmount)}</span>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState text="No payments found for this purchase." />
      ) : (
        <div className="pfl-supledger__table-wrap">
          <table className="pfl-supledger__table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Against Purchase</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Description</th>
                <th className="pfl-supledger__col-right">Amount</th>
                {purchaseFilter === "all" && <th className="pfl-supledger__col-right">Balance (Overall)</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, idx) => (
                <tr key={idx}>
                  <td>{fmtDate(e.date)}</td>
                  <td className="pfl-supledger__cell-strong">{e.reference || "—"}</td>
                  <td>{e.method || "—"}</td>
                  <td>{e.refrence || "—"}</td>
                  <td>{e.description || "—"}</td>
                  <td className="pfl-supledger__col-right">{fmtMoney(e.amount)}</td>
                  {purchaseFilter === "all" && (
                    <td className="pfl-supledger__col-right pfl-supledger__balance-cell">{fmtMoney(e.runningBalance)}</td>
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
  if (!returns.length) return <EmptyState text="No returns recorded for this supplier yet." />;

  return (
    <div className="pfl-supledger__table-wrap">
      <table className="pfl-supledger__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Return No</th>
            <th>Against Purchase</th>
            <th>Items</th>
            <th>Reason</th>
            <th>Refund Method</th>
            <th className="pfl-supledger__col-right">Amount</th>
            <th className="pfl-supledger__col-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {returns.map((r) => (
            <tr key={r._id}>
              <td>{fmtDate(r.createdAt)}</td>
              <td className="pfl-supledger__cell-strong">{r.returnNo}</td>
              <td>{r.purchase?.purchaseNumber || "—"}</td>
              <td>{(r.items || []).map((it) => it.product?.name).filter(Boolean).join(", ") || "—"}</td>
              <td>{r.reason || "—"}</td>
              <td>{r.refundMethod || "—"}</td>
              <td className="pfl-supledger__col-right">{fmtMoney(r.totalAmount)}</td>
              <td className="pfl-supledger__col-right">
                <button className="pfl-supledger__view-btn" onClick={() => onView?.(r)}>
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
  if (!notes.length) return <EmptyState text="No credit notes issued by this supplier yet." />;

  return (
    <div className="pfl-supledger__table-wrap">
      <table className="pfl-supledger__table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Credit Note #</th>
            <th>Against Purchase</th>
            <th>Amount</th>
            <th>Used</th>
            <th>Remaining</th>
            <th>Status</th>
            <th className="pfl-supledger__col-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {notes.map((n) => (
            <tr key={n._id}>
              <td>{fmtDate(n.createdAt)}</td>
              <td className="pfl-supledger__cell-strong">{n.creditNoteNumber}</td>
              <td>{n.purchase?.purchaseNumber || "—"}</td>
              <td>{fmtMoney(n.amount)}</td>
              <td>{fmtMoney(n.usedAmount)}</td>
              <td className={n.remainingAmount > 0 ? "pfl-supledger__due-cell" : ""}>{fmtMoney(n.remainingAmount)}</td>
              <td>
                <span
                  className={`pfl-supledger__status pfl-supledger__status--${
                    n.status === "active" ? "partial" : n.status === "used" ? "paid" : "unPaid"
                  }`}
                >
                  {n.status}
                </span>
              </td>
              <td className="pfl-supledger__col-right">
                <button className="pfl-supledger__view-btn" onClick={() => onView?.(n)}>
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
  return <div className="pfl-supledger__empty">{text}</div>;
}