import mongoose from "mongoose";

const purchaseReturnSchema = new mongoose.Schema(
  {
    returnNo: { type: String, required: true, unique: true },
    purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchases", required: true },
    supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Suppliers", required: true },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
        batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batches", required: true },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true }
      }
    ],
    subTotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    reason: { type: String, default: "" },
    refundMethod: { type: String, enum: [ "cash", "bank", "jazzCash", "easyPaisa", "creditNote" ], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true }
  },
  {
    timestamps: true
  }
);

export default mongoose.model("PurchaseReturns", purchaseReturnSchema);