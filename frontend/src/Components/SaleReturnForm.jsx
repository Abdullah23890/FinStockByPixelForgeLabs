import { useEffect, useMemo, useState } from "react";
import "../Css/SaleReturnForm.css";

const REFUND_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "bank", label: "Bank Transfer" },
  { value: "jazzCash", label: "JazzCash" },
  { value: "easyPaisa", label: "EasyPaisa" },
  { value: "creditNote", label: "Credit Note (adjust balance)" },
];

export default function SaleReturnForm({
  sale,
  saleReturns = [],
  onSubmit,
  onCancel,
  submitting = false,
  serverError = "",
  loading = false,
}) {
  const [returnQty, setReturnQty] = useState({});
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("cash");
  const [error, setError] = useState("");

  function keyFor(it) {
    return `${it.product?._id || it.product}-${
      it.batch?._id || it.batch
    }`;
  }

  // =========================
  // Already Returned Quantity
  // =========================

  const returnedQtyByKey = useMemo(() => {
    const map = {};

    saleReturns.forEach((saleReturn) => {
      (saleReturn.items || []).forEach((item) => {
        const key = keyFor(item);

        map[key] =
          (map[key] || 0) + Number(item.quantity || 0);
      });
    });

    return map;
  }, [saleReturns]);

  // =========================
  // Reset Quantity When Sale Changes
  // =========================

  useEffect(() => {
    if (!sale) {
      setReturnQty({});
      return;
    }

    const initial = {};

    (sale.items || []).forEach((item) => {
      initial[keyFor(item)] = 0;
    });

    setReturnQty(initial);
    setReason("");
    setRefundMethod("cash");
    setError("");
  }, [sale?._id]);

  // =========================
  // No Sale Selected
  // =========================

  if (!sale) return null;

  function getRemainingQty(item) {
    const soldQty = Number(item.quantity || 0);

    const alreadyReturned =
      Number(returnedQtyByKey[keyFor(item)] ?? item.returnQuantity ?? 0);

    return Math.max(
      soldQty - alreadyReturned,
      0
    );
  }

  const availableRefundMethods = useMemo(() => {
    const isRegistered = sale?.customerType === "registered" && !!sale?.customer;
    if (isRegistered) return REFUND_METHODS;
    return REFUND_METHODS.filter((m) => m.value !== "creditNote");
  }, [sale]);

  function handleQtyChange(key, value, maxQty) {
    const qty = Math.max(
      0,
      Math.min(Number(value) || 0, maxQty)
    );

    setReturnQty((prev) => ({
      ...prev,
      [key]: qty,
    }));

    setError("");
  }

  // =========================
  // Selected Return Items
  // =========================

  const returnItems = (sale.items || [])
    .map((item) => ({
      ...item,
      key: keyFor(item),
      qty: Number(returnQty[keyFor(item)] || 0),
    }))
    .filter((item) => item.qty > 0);

  // =========================
  // Return SubTotal
  // =========================

  const returnSubTotal = returnItems.reduce(
    (sum, item) => {
      const originalQty = Number(item.quantity || 0);

      if (originalQty <= 0) return sum;

      const itemTotal = Number(item.total || 0);

      const perUnitTotal =
        itemTotal / originalQty;

      return sum + perUnitTotal * item.qty;
    },
    0
  );

  // =========================
  // Proportional Bill Discount
  // =========================

  const saleSubTotal =
    Number(sale.subTotal || 0);

  const returnRatio =
    saleSubTotal > 0
      ? returnSubTotal / saleSubTotal
      : 0;

  const returnDiscount =
    Number(sale.discount || 0) *
    returnRatio;

  // =========================
  // Proportional Tax
  // =========================

  const returnTax =
    Number(sale.tax || 0) *
    returnRatio;

  // =========================
  // Final Refund Amount
  // =========================

  const returnTotal = Math.max(
    returnSubTotal -
      returnDiscount +
      returnTax,
    0
  );

  function handleSubmit(e) {
    e.preventDefault();

    if (returnItems.length === 0) {
      setError(
        "Select at least one item to return."
      );
      return;
    }

    onSubmit?.({
      saleId: sale._id,

      items: returnItems.map((item) => ({
        product:
          item.product?._id ||
          item.product,

        batch:
          item.batch?._id ||
          item.batch,

        quantity: item.qty,
      })),

      reason,
      refundMethod,
    });
  }

  return (
    <form
      className="pfl-return"
      onSubmit={handleSubmit}
      noValidate
    >
      {loading && (
        <div className="pfl-return__loading">
          <span>Loading previous returns...</span>
        </div>
      )}

      {serverError && (
        <div className="pfl-return__server-error">
          {serverError}
        </div>
      )}

      {error && (
        <div className="pfl-return__server-error">
          {error}
        </div>
      )}

      <div className="pfl-return__info">
        <span>
          Sale #{sale.saleNumber}
        </span>

        <span>
          {sale.customer?.name ||
            "Walk-in Customer"}
        </span>

        <span>
          Due: PKR {(sale.dueAmount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="pfl-return__items">
        <div className="pfl-return__items-head">
          <span>Product</span>
          <span>Sold</span>
          <span>Returned</span>
          <span>Return Qty</span>
          <span>Amount</span>
        </div>

        {(sale.items || []).length === 0 ? (
          <div className="pfl-return__no-items">
            <p>No items in this sale</p>
          </div>
        ) : (
          (sale.items || []).map((item) => {
            const key = keyFor(item);

            const qty =
              Number(returnQty[key] || 0);

            const alreadyReturned =
              Number(returnedQtyByKey[key] || 0);

            const remainingQty =
              getRemainingQty(item);

            const originalQty =
              Number(item.quantity || 0);

            const perUnitTotal =
              originalQty > 0
                ? Number(item.total || 0) /
                  originalQty
                : 0;

            const lineTotal =
              perUnitTotal * qty;

            return (
              <div
                className="pfl-return__item-row"
                key={key}
              >
                <span className="pfl-return__product-name">
                  {item.product?.name || "—"}
                </span>

                <span>
                  {originalQty}
                </span>

                <span>
                  {alreadyReturned}
                </span>

                <input
                  type="number"
                  min="0"
                  max={remainingQty}
                  value={qty}
                  disabled={remainingQty === 0}
                  onChange={(e) =>
                    handleQtyChange(
                      key,
                      e.target.value,
                      remainingQty
                    )
                  }
                />

                <span className="pfl-return__line-total">
                  PKR{" "}
                  {lineTotal.toLocaleString(
                    undefined,
                    {
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="pfl-return__calculation">
        <div>
          <span>Return Subtotal</span>

          <strong>
            PKR{" "}
            {returnSubTotal.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>

        <div>
          <span>Discount</span>

          <strong>
            - PKR{" "}
            {returnDiscount.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>

        <div>
          <span>Tax</span>

          <strong>
            + PKR{" "}
            {returnTax.toLocaleString(
              undefined,
              {
                maximumFractionDigits: 2,
              }
            )}
          </strong>
        </div>
      </div>

      <div className="pfl-return__total">
        <span>Total Refund Amount</span>

        <strong>
          PKR{" "}
          {returnTotal.toLocaleString(
            undefined,
            {
              maximumFractionDigits: 2,
            }
          )}
        </strong>
      </div>

      <div className="pfl-return__field">
        <label>Refund method</label>

        <select
          value={refundMethod}
          onChange={(e) =>
            setRefundMethod(e.target.value)
          }
        >
          {availableRefundMethods.map((method) => (
            <option
              key={method.value}
              value={method.value}
            >
              {method.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pfl-return__field">
        <label>
          Reason (optional)
        </label>

        <textarea
          rows={2}
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
          placeholder="e.g. Product defective, wrong item..."
        />
      </div>

      <div className="pfl-return__actions">
        <button
          type="button"
          className="pfl-return__btn pfl-return__btn--ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="pfl-return__btn pfl-return__btn--primary"
          disabled={
            submitting ||
            returnItems.length === 0 ||
            loading
          }
        >
          {submitting
            ? "Processing..."
            : "Process Return"}
        </button>
      </div>
    </form>
  );
}
