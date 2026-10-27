import { useState, useEffect } from "react";
import SearchableSelect from "./SearchableSelect";
import "../Css/PurchaseForm.css";

function emptyItem() {
  return {
    id: crypto.randomUUID(),
    batchId: null,
    product: "",
    batchNo: "",
    // expiryDate: "",
    quantity: 1,
    purchasePrice: 0,
  };
}

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "jazzCash", label: "JazzCash" },
  { value: "easyPaisa", label: "EasyPaisa" },
];

export default function PurchaseForm({
  initialData = null,
  suppliers = [],
  products = [],
  creditNotes = [],
  creditNoteLoading = false,
  onSupplierChange,
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
}) {
  const isEditMode = Boolean(initialData);

  const [supplier, setSupplier] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([emptyItem()]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [useCreditNote, setUseCreditNote] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState("");
  const [creditNoteAmount, setCreditNoteAmount] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setSupplier(initialData.supplier?._id || initialData.supplier || "");
      setPurchaseDate(initialData.purchaseDate ? initialData.purchaseDate.slice(0, 10) : "");
      setPaidAmount(initialData.paidAmount ?? 0);
      setItems(
        initialData.items?.length
          ? initialData.items.map((it) => ({
              id: crypto.randomUUID(),
              batchId: it.batchId || null,
              product: it.product?._id || it.product || "",
              batchNo: it.batchNo || "",
              // expiryDate: it.expiryDate ? it.expiryDate.slice(0, 10) : "",
              quantity: it.quantity ?? 1,
              purchasePrice: it.purchasePrice ?? 0,
            }))
          : [emptyItem()]
      );
    }
  }, [initialData]);

  function handleSupplierChange(supplierId) {
    setSupplier(supplierId);
    setUseCreditNote(false);
    setSelectedCreditNote("");
    setCreditNoteAmount(0);
    onSupplierChange?.(supplierId);
  }

  const totalAmount = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.purchasePrice) || 0),
    0
  );

  const creditApplied = useCreditNote ? Number(creditNoteAmount || 0) : 0;
  const remainingAmount = Math.max(totalAmount - (Number(paidAmount) || 0) - creditApplied, 0);

  function handleItemChange(id, field, value) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
    setErrors((prev) => ({ ...prev, items: "" }));
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
  }

  function removeItem(id) {
    setItems((prev) => (prev.length > 1 ? prev.filter((it) => it.id !== id) : prev));
  }

  function validate() {
    const next = {};

    if (!supplier) next.supplier = "Please select a supplier";
    if (!purchaseDate) next.purchaseDate = "Purchase date is required";

    const hasInvalidItem = items.some(
      (it) => !it.product || !it.batchNo.trim() || Number(it.quantity) <= 0 || Number(it.purchasePrice) < 0
    );
    if (hasInvalidItem) next.items = "Fill in all fields for every item (product, batch no, expiry, quantity, price)";

    if (!isEditMode) {
      if (paidAmount && Number(paidAmount) < 0) next.paidAmount = "Paid amount can't be negative";
      if (Number(paidAmount) + creditApplied > totalAmount) next.paidAmount = "Paid amount + credit note can't exceed total amount";

      if (useCreditNote && !selectedCreditNote) next.creditNote = "Please select a credit note";
      if (useCreditNote && Number(creditNoteAmount) <= 0) next.creditNoteAmount = "Credit note amount must be greater than 0";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const itemsPayload = items.map((it) => ({
      batchId: it.batchId || undefined,
      product: it.product,
      batchNo: it.batchNo,
      //expiryDate: it.expiryDate,
      quantity: Number(it.quantity),
      purchasePrice: Number(it.purchasePrice),
    }));

    if (isEditMode) {
      onSubmit?.({
        supplier,
        purchaseDate,
        items: itemsPayload,
      });
      return;
    }

    const paid = Number(paidAmount) || 0;
    const finalPayments = [];

    if (useCreditNote && selectedCreditNote && Number(creditNoteAmount) > 0) {
      finalPayments.push({
        amount: Number(creditNoteAmount),
        paymentMethod: "creditNote",
        creditNote: selectedCreditNote,
        notes: "Credit note applied",
      });
    }

    if (paid > 0) {
      finalPayments.push({
        amount: paid,
        paymentMethod,
        refrence: reference,
        notes,
      });
    }

    const payload = {
      supplier,
      purchaseDate,
      items: itemsPayload,
      totalAmount,
      payment: finalPayments,
    };

    onSubmit?.(payload);
  }

  const selectedNote = creditNotes.find((note) => note._id === selectedCreditNote);
  const maxCreditAmount = selectedNote ? Number(selectedNote.remainingAmount || 0) : 0;

  return (
    <form className="pfl-purform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-purform__server-error">{serverError}</div>}

      <div className="pfl-purform__grid">
        <div className="pfl-purform__field">
          <label>Supplier</label>
          <SearchableSelect
            options={suppliers}
            value={supplier}
            onChange={handleSupplierChange}
            placeholder="Search and select a supplier..."
            getLabel={(s) => s.name}
            getSubLabel={(s) => s.contactNo}
            disabled={isEditMode}
          />
          {errors.supplier && <span className="pfl-purform__error">{errors.supplier}</span>}
        </div>

        <div className="pfl-purform__field">
          <label>Purchase date</label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className={errors.purchaseDate ? "is-invalid" : ""}
          />
          {errors.purchaseDate && <span className="pfl-purform__error">{errors.purchaseDate}</span>}
        </div>
      </div>

      {/* Credit Notes Section — sirf Add mode mein, supplier select hone ke baad */}
      {!isEditMode && supplier && !creditNoteLoading && creditNotes.length > 0 && (
        <div className="pfl-purform__credit-notes">
          <div className="pfl-purform__field pfl-purform__field--full">
            <label>
              <input
                type="checkbox"
                checked={useCreditNote}
                onChange={(e) => {
                  setUseCreditNote(e.target.checked);
                  if (!e.target.checked) {
                    setSelectedCreditNote("");
                    setCreditNoteAmount(0);
                  }
                }}
              />
              Use Supplier Credit Note
            </label>
          </div>

          {useCreditNote && (
            <>
              <div className="pfl-purform__field">
                <label>Select Credit Note</label>
                <select
                  value={selectedCreditNote}
                  onChange={(e) => {
                    setSelectedCreditNote(e.target.value);
                    setCreditNoteAmount(0);
                  }}
                >
                  <option value="">-- Select credit note --</option>
                  {creditNotes.map((note) => (
                    <option key={note._id} value={note._id}>
                      {note.creditNoteNumber} - PKR {Number(note.remainingAmount || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
                {errors.creditNote && <span className="pfl-purform__error">{errors.creditNote}</span>}
              </div>

              {selectedNote && (
                <div className="pfl-purform__field">
                  <label>Credit Note Amount</label>
                  <input
                    type="number"
                    min="0"
                    max={maxCreditAmount}
                    value={creditNoteAmount}
                    onChange={(e) => setCreditNoteAmount(e.target.value)}
                    placeholder={`Max: PKR ${maxCreditAmount.toLocaleString()}`}
                  />
                  {errors.creditNoteAmount && <span className="pfl-purform__error">{errors.creditNoteAmount}</span>}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="pfl-purform__items">
        <div className="pfl-purform__items-head">
          <h4>Items</h4>
          {/* <button type="button" className="pfl-purform__add-item-btn" onClick={addItem}>
            + Add item
          </button> */}
        </div>

        {errors.items && <span className="pfl-purform__error">{errors.items}</span>}

        <div className="pfl-purform__items-list">
          {items.map((it) => (
            <div className="pfl-purform__item-row" key={it.id}>
              <div className="pfl-purform__item-field pfl-purform__item-field--product">
                <label>Product</label>
                <SearchableSelect
                  options={products}
                  value={it.product}
                  onChange={(val) => handleItemChange(it.id, "product", val)}
                  placeholder="Search product..."
                  getLabel={(p) => p.name}
                  getSubLabel={(p) => p.barcode}
                />
              </div>

              <div className="pfl-purform__item-field">
                <label>Batch No</label>
                <input
                  value={it.batchNo}
                  onChange={(e) => handleItemChange(it.id, "batchNo", e.target.value)}
                  placeholder="e.g. BATCH-JAN-2026"
                />
              </div>

              {/* <div className="pfl-purform__item-field">
                <label>Expiry</label>
                <input
                  type="date"
                  value={it.expiryDate}
                  onChange={(e) => handleItemChange(it.id, "expiryDate", e.target.value)}
                />
              </div> */}

              <div className="pfl-purform__item-field">
                <label>Qty</label>
                <input
                  type="number"
                  min="0"
                  value={it.quantity}
                  onChange={(e) => handleItemChange(it.id, "quantity", e.target.value)}
                />
              </div>

              <div className="pfl-purform__item-field">
                <label>Price</label>
                <input
                  type="number"
                  min="0"
                  value={it.purchasePrice}
                  onChange={(e) => handleItemChange(it.id, "purchasePrice", e.target.value)}
                />
              </div>

              <div className="pfl-purform__item-field pfl-purform__item-field--subtotal">
                <label>Subtotal</label>
                <span>PKR {((Number(it.quantity) || 0) * (Number(it.purchasePrice) || 0)).toLocaleString()}</span>
              </div>

              <button
                type="button"
                className="pfl-purform__remove-item-btn"
                onClick={() => removeItem(it.id)}
                disabled={items.length === 1}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

<div className="pfl-purform__items-head">
  <h4></h4>
          <button type="button" className="pfl-purform__add-item-btn" onClick={addItem}>
            + Add item
          </button>
        </div>

      </div>

      {!isEditMode && (
        <div className="pfl-purform__grid pfl-purform__grid--payment">
          {useCreditNote && selectedNote && (
            <div className="pfl-purform__field">
              <label>Credit Note Applied</label>
              <input value={`- PKR ${Number(creditNoteAmount || 0).toLocaleString()}`} disabled />
            </div>
          )}

          <div className="pfl-purform__field">
            <label>Paid amount (PKR)</label>
            <input
              type="number"
              min="0"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              className={errors.paidAmount ? "is-invalid" : ""}
            />
            {errors.paidAmount && <span className="pfl-purform__error">{errors.paidAmount}</span>}
          </div>

          <div className="pfl-purform__field">
            <label>Remaining amount</label>
            <input value={`PKR ${remainingAmount.toLocaleString()}`} disabled />
          </div>

          <div className="pfl-purform__field">
            <label>Total amount</label>
            <input value={`PKR ${totalAmount.toLocaleString()}`} disabled />
          </div>

          {Number(paidAmount) > 0 && (
            <>
              <div className="pfl-purform__field">
                <label>Payment method</label>
                <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pfl-purform__field">
                <label>Reference (optional)</label>
                <input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. transaction ID" />
              </div>

              <div className="pfl-purform__field pfl-purform__field--full">
                <label>Notes (optional)</label>
                <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any notes about this payment..." />
              </div>
            </>
          )}
        </div>
      )}

      {isEditMode && (
        <div className="pfl-purform__grid pfl-purform__grid--payment">
          <div className="pfl-purform__field">
            <label>Paid amount</label>
            <input value={`PKR ${Number(initialData?.paidAmount || 0).toLocaleString()}`} disabled />
          </div>
          <div className="pfl-purform__field">
            <label>Total amount</label>
            <input value={`PKR ${totalAmount.toLocaleString()}`} disabled />
          </div>
          <div className="pfl-purform__field">
            <label>Remaining amount</label>
            <input value={`PKR ${Math.max(totalAmount - Number(initialData?.paidAmount || 0), 0).toLocaleString()}`} disabled />
          </div>
        </div>
      )}

      {isEditMode && (
        <div className="pfl-purform__edit-hint">
          Editing items will adjust stock quantities automatically. Payments can only be added via <strong>Add Payment</strong>.
        </div>
      )}

      <div className="pfl-purform__actions">
        <button type="button" className="pfl-purform__btn pfl-purform__btn--ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="pfl-purform__btn pfl-purform__btn--primary" disabled={submitting}>
          {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Create Purchase"}
        </button>
      </div>
    </form>
  );
}