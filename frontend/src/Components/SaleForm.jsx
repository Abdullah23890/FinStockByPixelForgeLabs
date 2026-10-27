import { useState, useEffect, useMemo, useRef } from "react";
import SearchableSelect from "./SearchableSelect";
import "../Css/SaleForm.css";

const CHANNELS = [
  { value: "retail", label: "Retail" },
  { value: "wholeSale", label: "Wholesale" },
  // { value: "parlor", label: "Parlor" },
];

const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "jazzCash", label: "JazzCash" },
  { value: "easyPaisa", label: "EasyPaisa" },
];

const PRINT_SIZES = [
  { value: "thermal", label: "Thermal Receipt" },
  { value: "a4", label: "A4" },
];

const PRICE_FIELD_BY_CHANNEL = {
  retail: "retailPrice",
  wholeSale: "wholesalePrice",
  // parlor: "parlorPrice",
};

function emptyItem() {
  return {
    id: crypto.randomUUID(),
    product: "",
    batch: "",
    quantity: 1,
    unitPrice: 0,
    purchasePrice: 0,
    discount: 0,
    availableQty: 0,
  };
}

export default function SaleForm({
  products = [],
  customers = [],
  batchesByProduct = {},
  creditNotes = [],
  creditNoteLoading = false,
  onCustomerChange,
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
}) {
  const [customerType, setCustomerType] = useState("walkIn");
  const [channel, setChannel] = useState("retail");
  const [customer, setCustomer] = useState("");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState([]);
  const [billDiscount, setBillDiscount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [refrence, setRefrence] = useState("");
  const [notes, setNotes] = useState("");
  const [printSize, setPrintSize] = useState("thermal");
  const [useCreditNote, setUseCreditNote] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState("");
  const [creditNoteAmount, setCreditNoteAmount] = useState(0);
  const [errors, setErrors] = useState({});
  const [barcode, setBarcode] = useState("");
  const barcodeInputRef = useRef(null);

  const isWalkIn = customerType === "walkIn";

  // ===== Handle customer change to load credit notes =====
  function handleCustomerChange(customerId) {
    setCustomer(customerId);
    setUseCreditNote(false);
    setSelectedCreditNote("");
    setCreditNoteAmount(0);
    onCustomerChange?.(customerId);
  }

  // ===== Cascade: customerType → channel → customer =====
  function handleCustomerTypeChange(value) {
    setCustomerType(value);
    if (value === "walkIn") {
      setChannel("retail");
      setCustomer("");
      setUseCreditNote(false);
      setSelectedCreditNote("");
    } else {
      setCustomer("");
    }
  }

  function handleChannelChange(value) {
    const priceField = PRICE_FIELD_BY_CHANNEL[value];

    setChannel(value);
    setCustomer("");

    setItems((prev) =>
      prev.map((it) => {
        if (!it.product) return it;
        const product = products.find((p) => p._id === it.product);
        const unitPrice = product?.[priceField] ?? 0;
        return { ...it, unitPrice };
      })
    );
  }

  const filteredCustomers = useMemo(
    () => customers.filter((c) => c.type === channel),
    [customers, channel]
  );

  // ===== Item helpers =====
  function handleProductChange(itemId, productId) {
    const product = products.find((p) => p._id === productId);
    const priceField = PRICE_FIELD_BY_CHANNEL[channel];
    const unitPrice = product?.[priceField] ?? 0;

    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? { ...it, product: productId, batch: "", unitPrice, purchasePrice: 0, availableQty: 0 }
          : it
      )
    );
  }

  function handleBarcodeScan(e) {
    e.preventDefault();

    const scannedBarcode = barcode.trim();
    if (!scannedBarcode) return;

    const product = products.find(
      (p) => String(p.barcode).trim().toLowerCase() === scannedBarcode.toLowerCase()
    );

    if (!product) {
      setErrors((prev) => ({
        ...prev,
        barcode: `Product not found for barcode: ${scannedBarcode}`
      }));

      setBarcode("");

      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 100);

      return;
    }

    const availableBatches = batchesByProduct[product._id] || [];

    const batch = [...availableBatches]
  .filter((b) => Number(b.quantity) > 0)
  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))[0];

    if (!batch) {
      setErrors((prev) => ({
        ...prev,
        barcode: `${product.name} is out of stock`
      }));

      setBarcode("");

      setTimeout(() => {
        barcodeInputRef.current?.focus();
      }, 50);

      return;
    }

    const priceField = PRICE_FIELD_BY_CHANNEL[channel];
    const unitPrice = product?.[priceField] ?? 0;

    setItems((prev) => {
      const existingItem = prev.find(
        (it) => it.product === product._id && it.batch === batch._id
      );

      if (existingItem) {
        const newQuantity = Number(existingItem.quantity) + 1;

        if (newQuantity > Number(batch.quantity)) {
          setErrors((prevErrors) => ({
            ...prevErrors,
            barcode: `Only ${batch.quantity} items available for ${product.name}`,
          }));
          return prev;
        }

        setErrors((prevErrors) => ({ ...prevErrors, barcode: "", items: "" }));
        return prev.map((it) =>
          it.id === existingItem.id ? { ...it, quantity: newQuantity } : it
        );
      }

      const newItem = {
        id: crypto.randomUUID(),
        product: product._id,
        batch: batch._id,
        quantity: 1,
        unitPrice,
        purchasePrice: batch.purchasePrice ?? 0,
        discount: 0,
        availableQty: batch.quantity ?? 0,
      };

      setErrors((prevErrors) => ({ ...prevErrors, barcode: "", items: "" }));
      return [...prev, newItem];
    });

    setBarcode("");

    setTimeout(() => {
      barcodeInputRef.current?.focus();
    }, 50);
  }

  function handleBatchChange(itemId, batchId) {
    const item = items.find((it) => it.id === itemId);
    const batches = batchesByProduct[item?.product] || [];
    const batch = batches.find((b) => b._id === batchId);

    setItems((prev) =>
      prev.map((it) =>
        it.id === itemId
          ? {
              ...it,
              batch: batchId,
              purchasePrice: batch?.purchasePrice ?? 0,
              availableQty: batch?.quantity ?? 0,
            }
          : it
      )
    );
  }

  function handleItemChange(itemId, field, value) {
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)));
    setErrors((prev) => ({ ...prev, items: "" }));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      emptyItem()
    ]);
  }

  function removeItem(itemId) {
    setItems((prev) =>
      prev.filter((it) => it.id !== itemId)
    );
  }

  function itemTotal(it) {
    return Math.max(Number(it.quantity || 0) * Number(it.unitPrice || 0) - Number(it.discount || 0), 0);
  }

  function itemProfit(it) {
    return (Number(it.unitPrice || 0) - Number(it.purchasePrice || 0)) * Number(it.quantity || 0) - Number(it.discount || 0);
  }

  const subTotal = items.reduce((sum, it) => sum + itemTotal(it), 0);
  const totalAmount = Math.max(subTotal - Number(billDiscount || 0) + Number(tax || 0), 0);

  // ===== Walk-in enforcement: no credit, must be fully paid =====
  useEffect(() => {
    if (isWalkIn) {
      setPaidAmount(totalAmount);
    }
  }, [isWalkIn, totalAmount]);

  // ===== Calculate remaining due after credit note =====
  const creditApplied = useCreditNote ? Number(creditNoteAmount || 0) : 0;
  const dueAmount = isWalkIn ? 0 : Math.max(totalAmount - Number(paidAmount || 0) - creditApplied, 0);

  function validate() {
    const next = {};

    if (!isWalkIn && !customer) {
      next.customer = "Please select a customer";
    }

    if (items.length === 0) {
      next.items = "Please add at least one item";
    }

    const hasInvalidItem = items.some(
      (it) => !it.product || !it.batch || Number(it.quantity) <= 0
    );

    if (hasInvalidItem) {
      next.items = "Select product, batch, and a valid quantity for every item";
    }

    const overStock = items.some((it) => Number(it.quantity) > Number(it.availableQty));
    if (overStock) {
      next.items = "One or more items exceed the available batch stock";
    }

    if (isWalkIn && Number(paidAmount) < totalAmount) {
      next.paidAmount = "Walk-in sales can't be on credit — full payment is required";
    }

    // Validate using actual amounts (cash input + credit applied)
    const paid = Number(paidAmount) || 0;
    if (!isWalkIn && paid + creditApplied > totalAmount) {
      next.paidAmount = "Paid amount + credit note can't exceed total amount";
    }

    if (useCreditNote && !selectedCreditNote) {
      next.creditNote = "Please select a credit note";
    }

    if (useCreditNote && Number(creditNoteAmount) <= 0) {
      next.creditNoteAmount = "Credit note amount must be greater than 0";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    const paid = Number(paidAmount) || 0;
    const credit = useCreditNote ? Number(creditNoteAmount || 0) : 0;
    const finalPayments = [];

    // Add credit note payment if used
    if (useCreditNote && selectedCreditNote && credit > 0) {
      finalPayments.push({
        amount: credit,
        paymentMethod: "creditNote",
        creditNote: selectedCreditNote,
        refrence: "",
        notes: "Credit note applied",
      });
    }

    // Add standard payment only for the cash portion entered by user
    if (paid > 0) {
      finalPayments.push({
        amount: paid,
        paymentMethod: isWalkIn ? "cash" : paymentMethod,
        refrence: isWalkIn ? "" : refrence,
        notes: isWalkIn ? "" : notes,
      });
    }

    const totalPaid = finalPayments.reduce((s, p) => s + Number(p.amount || 0), 0);

    const payload = {
      customerType,
      channel,
      customer: isWalkIn ? null : customer,
      saleDate,
      items: items.map((it) => ({
        product: it.product,
        batch: it.batch,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        purchasePrice: Number(it.purchasePrice),
        discount: Number(it.discount || 0),
        total: itemTotal(it),
        profit: itemProfit(it),
      })),
      subTotal,
      discount: Number(billDiscount || 0),
      tax: Number(tax || 0),
      totalAmount,
      // paidAmount should reflect the actual total paid (credit + cash)
      paidAmount: totalPaid,
      dueAmount,
      printSize,
      payment: finalPayments,
    };

    onSubmit?.(payload);
  }

  const selectedNote = creditNotes.find(note => note._id === selectedCreditNote);
  const maxCreditAmount = selectedNote ? Number(selectedNote.remainingAmount || 0) : 0;

  return (
    <form className="pfl-saleform" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="pfl-saleform__server-error">{serverError}</div>}

      <div className="pfl-saleform__field pfl-saleform__field--full">
        <label>Scan Barcode</label>
        <input
          ref={barcodeInputRef}
          type="text"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleBarcodeScan(e);
            }
          }}
          placeholder="Scan barcode..."
          autoFocus
        />
        {errors.barcode && (
          <span className="pfl-saleform__error">
            {errors.barcode}
          </span>
        )}
      </div>

      <div className="pfl-saleform__grid">
        <div className="pfl-saleform__field">
          <label>Customer Type</label>
          <select value={customerType} onChange={(e) => handleCustomerTypeChange(e.target.value)}>
            <option value="walkIn">Walk-in</option>
            <option value="registered">Registered</option>
          </select>
        </div>

        <div className="pfl-saleform__field">
          <label>Channel</label>
          <select
            value={channel}
            onChange={(e) => handleChannelChange(e.target.value)}
            disabled={isWalkIn}
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="pfl-saleform__field pfl-saleform__field--full">
          <label>Customer</label>
          <SearchableSelect
            options={filteredCustomers}
            value={customer}
            onChange={handleCustomerChange}
            placeholder={isWalkIn ? "Not required for walk-in sales" : "Search and select a customer..."}
            getLabel={(c) => c.name}
            getSubLabel={(c) => c.contactNo}
            disabled={isWalkIn}
          />
          {errors.customer && <span className="pfl-saleform__error">{errors.customer}</span>}
        </div>

        <div className="pfl-saleform__field">
          <label>Sale date</label>
          <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} />
        </div>

        <div className="pfl-saleform__field">
          <label>Print size</label>
          <select value={printSize} onChange={(e) => setPrintSize(e.target.value)}>
            {PRINT_SIZES.map((ps) => (
              <option key={ps.value} value={ps.value}>
                {ps.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Credit Notes Section */}
      {!isWalkIn && !creditNoteLoading && creditNotes.length > 0 && (
        <div className="pfl-saleform__credit-notes">
          <div className="pfl-saleform__field pfl-saleform__field--full">
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
              Use Credit Note
            </label>
          </div>

          {useCreditNote && (
            <>
              <div className="pfl-saleform__field">
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
                      {note.creditNoteNumber} - PKR {Number(note.remainingAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
                {errors.creditNote && <span className="pfl-saleform__error">{errors.creditNote}</span>}
              </div>

              {selectedNote && (
                <div className="pfl-saleform__field">
                  <label>Credit Note Amount</label>
                  <input
                    type="number"
                    min="0"
                    max={maxCreditAmount}
                    value={creditNoteAmount}
                    onChange={(e) => setCreditNoteAmount(e.target.value)}
                    placeholder={`Max: PKR ${maxCreditAmount.toLocaleString()}`}
                  />
                  {errors.creditNoteAmount && <span className="pfl-saleform__error">{errors.creditNoteAmount}</span>}
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div className="pfl-saleform__items">
        <div className="pfl-saleform__items-head">
          <h4>Items</h4>
          <button type="button" className="pfl-saleform__add-item-btn" onClick={addItem}>
            + Add item
          </button>
        </div>

        {errors.items && <span className="pfl-saleform__error">{errors.items}</span>}

        <div className="pfl-saleform__items-list">
          {items.length === 0 ? (
            <div className="pfl-saleform__no-items">
              <p>No items added yet. Use barcode scanner or add items manually.</p>
            </div>
          ) : (
            items.map((it) => {
              const availableBatches = batchesByProduct[it.product] || [];
              return (
                <div className="pfl-saleform__item-row" key={it.id}>
                  <div className="pfl-saleform__item-field pfl-saleform__item-field--product">
                    <label>Product</label>
                    <SearchableSelect
                      options={products}
                      value={it.product}
                      onChange={(val) => handleProductChange(it.id, val)}
                      placeholder="Search product..."
                      getLabel={(p) => p.name}
                      getSubLabel={(p) => p.barcode}
                    />
                  </div>

                  <div className="pfl-saleform__item-field">
                    <label>Batch {it.availableQty > 0 && `(${it.availableQty} in stock)`}</label>
                    <select
                      value={it.batch}
                      onChange={(e) => handleBatchChange(it.id, e.target.value)}
                      disabled={!it.product}
                    >
                      <option value="">Select batch</option>
                      {availableBatches.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.batchNo} — {b.quantity} left
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pfl-saleform__item-field">
                    <label>Qty</label>
                    <input
                      type="number"
                      min="1"
                      max={it.availableQty}
                      value={it.quantity}
                      onChange={(e) =>
                        handleItemChange(it.id, "quantity", e.target.value)
                      }
                    />
                  </div>

                  <div className="pfl-saleform__item-field">
                    <label>Unit Price</label>
                    <input
                      type="number"
                      min="0"
                      value={it.unitPrice}
                      onChange={(e) => handleItemChange(it.id, "unitPrice", e.target.value)}
                    />
                  </div>

                  <div className="pfl-saleform__item-field">
                    <label>Discount</label>
                    <input
                      type="number"
                      min="0"
                      value={it.discount}
                      onChange={(e) => handleItemChange(it.id, "discount", e.target.value)}
                    />
                  </div>

                  <div className="pfl-saleform__item-field pfl-saleform__item-field--subtotal">
                    <label>Total</label>
                    <span>PKR {itemTotal(it).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>

                  <button
                    type="button"
                    className="pfl-saleform__remove-item-btn"
                    onClick={() => removeItem(it.id)}
                  >
                    &times;
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pfl-saleform__grid pfl-saleform__grid--totals">
        <div className="pfl-saleform__field">
          <label>Bill discount (PKR)</label>
          <input type="number" min="0" value={billDiscount} onChange={(e) => setBillDiscount(e.target.value)} />
        </div>

        <div className="pfl-saleform__field">
          <label>Tax (PKR)</label>
          <input type="number" min="0" value={tax} onChange={(e) => setTax(e.target.value)} />
        </div>

        <div className="pfl-saleform__field">
          <label>Subtotal</label>
          <input value={`PKR ${subTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} disabled />
        </div>

        <div className="pfl-saleform__field">
          <label>Total amount</label>
          <input value={`PKR ${totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} disabled />
        </div>

        {useCreditNote && selectedNote && (
          <div className="pfl-saleform__field">
            <label>Credit Note Applied</label>
            <input value={`- PKR ${Number(creditNoteAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} disabled />
          </div>
        )}

        <div className="pfl-saleform__field">
          <label>Paid amount</label>
          <input
            type="number"
            min="0"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            disabled={isWalkIn}
            className={errors.paidAmount ? "is-invalid" : ""}
          />
          {errors.paidAmount && <span className="pfl-saleform__error">{errors.paidAmount}</span>}
        </div>

        <div className="pfl-saleform__field">
          <label>Due amount</label>
          <input value={`PKR ${dueAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} disabled />
        </div>

        {isWalkIn && (
          <div className="pfl-saleform__field pfl-saleform__field--full">
            <span className="pfl-saleform__walkin-note">
              Walk-in sales must be paid in full — credit isn't available without a registered customer.
            </span>
          </div>
        )}
      </div>

      {!isWalkIn && Number(paidAmount) > 0 && (
        <div className="pfl-saleform__grid pfl-saleform__grid--payment">
          <div className="pfl-saleform__field">
            <label>Payment Method</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.value} value={pm.value}>
                  {pm.label}
                </option>
              ))}
            </select>
          </div>

          <div className="pfl-saleform__field">
            <label>Reference</label>
            <input
              type="text"
              value={refrence}
              onChange={(e) => setRefrence(e.target.value)}
              placeholder="Reference number or cheque number..."
            />
          </div>

          <div className="pfl-saleform__field pfl-saleform__field--full">
            <label>Notes</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>
        </div>
      )}

      <div className="pfl-saleform__actions">
        <button type="button" className="pfl-saleform__btn pfl-saleform__btn--ghost" onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="pfl-saleform__btn pfl-saleform__btn--primary" disabled={submitting || creditNoteLoading}>
          {submitting ? "Saving..." : "Create Sale"}
        </button>
      </div>
    </form>
  );
}
