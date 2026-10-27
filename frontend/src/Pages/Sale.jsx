import { useEffect, useState} from "react";
import MainContent from "../Components/MainContent.jsx";
import SidePanel from "../Components/SidePanel.jsx";
import SaleForm from "../Components/SaleForm.jsx";
import SaleTable from "../Components/SaleTable.jsx";
import SaleView from "../Components/SaleView.jsx";
import AddSalePaymentForm from "../Components/AddSalePaymentForm.jsx";
import SaleReceipt from "../Components/SaleReceipt.jsx";
import SaleReturnForm from "../Components/SaleReturnForm.jsx";

import { 
    getProducts 
} from "../Api/product.api.js";
import { 
    getCustomers 
} from "../Api/customer.api.js";
import { 
    getNotExpireBatches
} from "../Api/batch.api.js";
import { 
    getSales, 
    createSale,
    addSalePayment,
    deleteSale
} from "../Api/sale.api.js";
import {
  createSaleReturn,
  getSaleReturnsBySale
} from "../Api/saleReturn.api.js";
import {
  getCreditNotes,
  getCreditNotesByCustomer
} from "../Api/creditNote.api.js";
import { 
  getSetting 
} from "../Api/setting.api.js";

export default function Sale() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [batchesByProduct, setBatchesByProduct] = useState({});
  const [creditNotes, setCreditNotes] = useState([]);
  const [creditNotesByCustomer, setCreditNotesByCustomer] = useState({});
  const [loading, setLoading] = useState(true);
  const [creditNoteLoading, setCreditNoteLoading] = useState(false);

  const [settings, setSettings] = useState(null); // ✅ naya

  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [viewSale, setViewSale] = useState(null);

  const [payingSale, setPayingSale] = useState(null);
  const [payingSubmitting, setPayingSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [returningSale, setReturningSale] = useState(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");

  const [saleReturns, setSaleReturns] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  
  const [printingSale, setPrintingSale] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [salesRes, productsRes, customersRes, batchesRes, creditNotesRes, settingRes] = await Promise.all([
        getSales(),
        getProducts(),
        getCustomers(),
        getNotExpireBatches(),
        getCreditNotes(),
        getSetting(),
      ]);
      setSales(salesRes.data.data);
      setProducts(productsRes.data.data);
      setCustomers(customersRes.data.data);
      setCreditNotes(creditNotesRes.data.data || []);
      setSettings(settingRes.data.data);

      const batchMap = {};
      for (const batch of batchesRes.data.data) {
        const productId = batch.product?._id || batch.product;
        if (batch.quantity > 0) {
          if (!batchMap[productId]) batchMap[productId] = [];
          batchMap[productId].push(batch);
        }
      }
      setBatchesByProduct(batchMap);
    } catch (err) {
      console.error("Failed to load sales:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

   function handlePrint(sale) {
    setPrintingSale(sale);
    // Component render hone ke liye chhota delay, phir print dialog
    setTimeout(() => {
      window.print();
    }, 150);
  }

  // ===== Load credit notes when customer changes =====
  async function handleCustomerChange(customerId) {
    setSelectedCustomerId(customerId);
    setCreditNoteLoading(true);

    try {
      const res = await getCreditNotesByCustomer(customerId);
      const notes = res.data.data || [];
      
      // Filter for active credit notes with remaining balance
      const activeCreditNotes = notes.filter(
        (note) => note.status === "active" && Number(note.remainingAmount || 0) > 0
      );

      setCreditNotesByCustomer((prev) => ({
        ...prev,
        [customerId]: activeCreditNotes,
      }));
    } catch (err) {
      console.error("Failed to load customer credit notes:", err);
      setCreditNotesByCustomer((prev) => ({
        ...prev,
        [customerId]: [],
      }));
    } finally {
      setCreditNoteLoading(false);
    }
  }

  function openAddForm() {
    setFormError("");
    setSelectedCustomerId("");
    setShowForm(true);
  }

  function openView(sale) {
    setViewSale(sale);
  }

  function closeView() {
    setViewSale(null);
  }

  function openAddPayment(sale) {
    setViewSale(null);
    setPaymentError("");
    setPayingSale(sale);
  }

  function closeAddPayment() {
    setPayingSale(null);
    setPaymentError("");
  }

  async function openReturn(sale) {
    setViewSale(null);
    setReturnError("");
    setSaleReturns([]);
    setReturningSale(sale);
    setReturnLoading(true);

    try {
      const res = await getSaleReturnsBySale(sale._id);
      setSaleReturns(res.data.data || []);
    } catch (err) {
      console.error("Failed to load sale returns:", err);

      setReturnError(
        err.response?.data?.message ||
        "Failed to load previous returns."
      );
    } finally {
      setReturnLoading(false);
    }
  }

  function closeReturn() {
    setReturningSale(null);
    setSaleReturns([]);
    setReturnError("");
  }

  async function handleSubmit(payload) {
  setSubmitting(true);
  setFormError("");

  try {
    const res = await createSale(payload);
    setShowForm(false);

    const salesRes = await getSales();
    setSales(salesRes.data.data);

    const createdSale = salesRes.data.data.find(
      (s) => s.saleNumber === res.data.data.saleNumber
    );

    if (createdSale) {
      handlePrint(createdSale);
    }

    loadData();
  } catch (err) {
    setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
  } finally {
    setSubmitting(false);
  }
}
  
  async function handleReturnSubmit(payload) {
    setReturnSubmitting(true);
    setReturnError("");
    try {
      await createSaleReturn(payload);
      closeReturn();
      loadData();
    } catch (err) {
      setReturnError(err.response?.data?.message || "Failed to process return.");
    } finally {
      setReturnSubmitting(false);
    }
  }

  async function handleDelete(sale) {
    if (!window.confirm(`Delete sale "${sale.saleNumber}"? This can't be undone.`)) return;
    try {
      await deleteSale(sale._id);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete sale.");
    }
  }

  async function handleAddPayment(saleId, paymentData) {
    setPayingSubmitting(true);
    setPaymentError("");
    try {
      await addSalePayment(saleId, paymentData);
      closeAddPayment();
      loadData();
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to add payment.");
    } finally {
      setPayingSubmitting(false);
    }
  }

  // Get customer's credit notes for the form
  const formCreditNotes = selectedCustomerId 
    ? (creditNotesByCustomer[selectedCustomerId] || [])
    : [];

   return (
    <>
      <MainContent
        pageTitle="Sales"
        pageSubtitle="Billing for retail, wholesale, and parlor customers."
        sections={[
          {
            id: "sale-management",
            title: showForm ? "New Sale" : null,
            content: showForm ? (
              <SaleForm
                products={products}
                customers={customers}
                batchesByProduct={batchesByProduct}
                creditNotes={formCreditNotes}
                creditNoteLoading={creditNoteLoading}
                onCustomerChange={handleCustomerChange}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <SaleTable
                sales={sales}
                loading={loading}
                onAddNew={openAddForm}
                onView={openView}
                onAddPayment={openAddPayment}
                onDelete={handleDelete}
                onPrint={handlePrint}
              />
            ),
          },
        ]}
      />

      <SidePanel open={viewSale !== null} onClose={closeView} title="Sale">
        <SaleView
          sale={viewSale}
          onClose={closeView}
          onAddPayment={openAddPayment}
          onReturn={openReturn}
          onPrint={handlePrint}
        />
      </SidePanel>

      <SidePanel open={payingSale !== null} onClose={closeAddPayment} title="Add Payment">
        <AddSalePaymentForm
          sale={payingSale}
          onSubmit={handleAddPayment}
          onCancel={closeAddPayment}
          submitting={payingSubmitting}
          serverError={paymentError}
        />
      </SidePanel>

      <SidePanel open={returningSale !== null} onClose={closeReturn} title="Sale Return">
        {returningSale && (
          <SaleReturnForm
            sale={returningSale}
            saleReturns={saleReturns}
            loading={returnLoading}
            onSubmit={handleReturnSubmit}
            onCancel={closeReturn}
            submitting={returnSubmitting}
            serverError={returnError}
          />
        )}
      </SidePanel>

      {/* ✅ Print area — hamesha DOM mein maujood, lekin sirf print ke waqt "visible" hoti hai (CSS se) */}
      <div className="pfl-receipt-hidden-wrapper">
        <SaleReceipt sale={printingSale} settings={settings} />
      </div>
    </>
  );
}