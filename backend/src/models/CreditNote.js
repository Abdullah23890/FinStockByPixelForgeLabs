import mongoose from "mongoose";

const creditNoteSchema = new mongoose.Schema(
    {
        creditNoteNumber: { type: String, unique: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customers", required: true },
        sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sales" },
        saleReturn: { type: mongoose.Schema.Types.ObjectId, ref: "SaleReturns" },
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

export default mongoose.model("CreditNotes", creditNoteSchema);