import { useEffect, useState } from "react";
import MainContent from "../Components/MainContent";
import SidePanel from "../Components/SidePanel";
import PurchaseForm from "../Components/PurchaseForm";
import PurchaseTable from "../Components/PurchaseTable";
import PurchaseView from "../Components/PurchaseView";
import PurchaseReturnForm from "../Components/PurchaseReturnForm";
import AddPurchasePaymentForm from "../Components/AddPurchasePaymentForm";

import {
  getSuppliers
} from "../Api/supplier.api.js";

import {
  getProducts
} from "../Api/product.api.js";

import {
  getPurchases,
  createPurchase,
  updatePurchase,
  addPurchasePayment
  //   deletePurchase,
} from "../Api/purchase.api.js";

import {
  createPurchaseReturn,
  getPurchaseReturnsByPurchase
} from "../Api/purchaseReturn.api.js";

import { 
  getSupplierCreditNotesBySupplier 
} from "../Api/supplierCreditNote.api.js";

export default function Purchase() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [viewPurchase, setViewPurchase] = useState(null);

  const [payingPurchase, setPayingPurchase] = useState(null);
  const [payingSubmitting, setPayingSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const [returningPurchase, setReturningPurchase] = useState(null);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [purchaseReturns, setPurchaseReturns] = useState([]);
  const [returnLoading, setReturnLoading] = useState(false);

  const [creditNotesBySupplier, setCreditNotesBySupplier] = useState({});
  const [creditNoteLoading, setCreditNoteLoading] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [purchasesRes, suppliersRes, productsRes] = await Promise.all([
        getPurchases(),
        getSuppliers(),
        getProducts(),
      ]);
      setPurchases(purchasesRes.data.data);
      setSuppliers(suppliersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      console.error("Failed to load purchases:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSupplierChange(supplierId) {
  setSelectedSupplierId(supplierId);
  setCreditNoteLoading(true);
  try {
    const res = await getSupplierCreditNotesBySupplier(supplierId);
    const notes = res.data.data || [];
    const activeCreditNotes = notes.filter((n) => n.status === "active" && Number(n.remainingAmount || 0) > 0);
    setCreditNotesBySupplier((prev) => ({ ...prev, [supplierId]: activeCreditNotes }));
  } catch (err) {
    console.error("Failed to load supplier credit notes:", err);
    setCreditNotesBySupplier((prev) => ({ ...prev, [supplierId]: [] }));
  } finally {
    setCreditNoteLoading(false);
  }
}

const formCreditNotes = selectedSupplierId ? creditNotesBySupplier[selectedSupplierId] || [] : [];

  function openAddForm() {
    setEditingPurchase(null);
    setFormError("");
    setSelectedSupplierId("");
    setShowForm(true);
  }

  function openEditForm(purchase) {
    setViewPurchase(null);
    setPayingPurchase(null);
    setEditingPurchase(purchase);
    setFormError("");
    setShowForm(true);
  }

  function openView(purchase) {
    setViewPurchase(purchase);
  }

  function closeView() {
    setViewPurchase(null);
  }

  function openAddPayment(purchase) {
    setViewPurchase(null);
    setPaymentError("");
    setPayingPurchase(purchase);
  }

  function closeAddPayment() {
    setPayingPurchase(null);
    setPaymentError("");
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setFormError("");
    try {
      if (editingPurchase) {
        await updatePurchase(editingPurchase._id, payload);
      } else {
        await createPurchase(payload);
      }
      setShowForm(false);
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // async function handleDelete(purchase) {
  //   if (!window.confirm(`Delete purchase "${purchase.purchaseNumber}"? This can't be undone.`)) return;
  //   try {
  //     await deletePurchase(purchase._id);
  //     loadData();
  //   } catch (err) {
  //     alert(err.response?.data?.message || "Failed to delete purchase.");
  //   }
  // }

  async function handleAddPayment(purchaseId, paymentData) {
    setPayingSubmitting(true);
    setPaymentError("");
    try {
      await addPurchasePayment(purchaseId, paymentData);
      closeAddPayment();
      loadData();
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to add payment.");
    } finally {
      setPayingSubmitting(false);
    }
  }

  async function openReturn(purchase) {
    setViewPurchase(null);
    setReturnError("");
    setPurchaseReturns([]);
    setReturningPurchase(purchase);
    setReturnLoading(true);

    try {
      const res = await getPurchaseReturnsByPurchase(purchase._id);
      setPurchaseReturns(res.data.data || []);
    } catch (err) {
      console.error("Failed to load purchase returns:", err);
      setReturnError(err.response?.data?.message || "Failed to load previous returns.");
    } finally {
      setReturnLoading(false);
    }
  }

  function closeReturn() {
    setReturningPurchase(null);
    setPurchaseReturns([]);
    setReturnError("");
  }

  async function handleReturnSubmit(payload) {
    setReturnSubmitting(true);
    setReturnError("");
    try {
      await createPurchaseReturn(payload);
      closeReturn();
      loadData();
    } catch (err) {
      setReturnError(err.response?.data?.message || "Failed to process return.");
    } finally {
      setReturnSubmitting(false);
    }
  }

  return (
    <>
      <MainContent
        pageTitle="Purchases"
        pageSubtitle="Record stock purchases from suppliers."
        sections={[
          {
            id: "purchase-management",
            title: showForm ? (editingPurchase ? "Edit Purchase" : "New Purchase") : null,
            content: showForm ? (
              <PurchaseForm
                initialData={editingPurchase}
                suppliers={suppliers}
                products={products}
                creditNotes={formCreditNotes}
                creditNoteLoading={creditNoteLoading}
                onSupplierChange={handleSupplierChange}
                onSubmit={handleSubmit}
                onCancel={() => setShowForm(false)}
                submitting={submitting}
                serverError={formError}
              />
            ) : (
              <PurchaseTable
                purchases={purchases}
                loading={loading}
                onAddNew={openAddForm}
                onView={openView}
                onEdit={openEditForm}
                onAddPayment={openAddPayment}
              // onDelete={handleDelete}
              />
            ),
          },
        ]}
      />

      <SidePanel open={viewPurchase !== null} onClose={closeView} title="Purchase">
        <PurchaseView
          purchase={viewPurchase}
          onClose={closeView}
          onAddPayment={openAddPayment}
          onEdit={openEditForm}
          onReturn={openReturn}
        />
      </SidePanel>

      <SidePanel open={payingPurchase !== null} onClose={closeAddPayment} title="Add Payment">
        <AddPurchasePaymentForm
          purchase={payingPurchase}
          onSubmit={handleAddPayment}
          onCancel={closeAddPayment}
          submitting={payingSubmitting}
          serverError={paymentError}
        />
      </SidePanel>
      <SidePanel open={returningPurchase !== null} onClose={closeReturn} title="Purchase Return">
        {returningPurchase && (
          <PurchaseReturnForm
            purchase={returningPurchase}
            purchaseReturns={purchaseReturns}
            loading={returnLoading}
            onSubmit={handleReturnSubmit}
            onCancel={closeReturn}
            submitting={returnSubmitting}
            serverError={returnError}
          />
        )}
      </SidePanel>
    </>
  );
}