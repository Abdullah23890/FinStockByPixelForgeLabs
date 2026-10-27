import mongoose from "mongoose";

const supplierCreditNoteSchema = new mongoose.Schema(
    {
        creditNoteNumber: { type: String, unique: true },
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Suppliers", required: true },
        purchase: { type: mongoose.Schema.Types.ObjectId, ref: "Purchases" },
        purchaseReturn: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseReturns" },
        amount: Number,
        usedAmount: { type: Number, default: 0 },
        remainingAmount: Number,
        status: { type: String, enum: ["active", "used", "expired"], default: "active" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    },
    { 
        timestamps: true 
    }
);

export default mongoose.model("SupplierCreditNotes", supplierCreditNoteSchema);