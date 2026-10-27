import mongoose from "mongoose";

const saleReturnSchema = new mongoose.Schema(
    {
        returnNo: { type: String, required: true, unique: true },
        sale: { type: mongoose.Schema.Types.ObjectId, ref: "Sales", required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customers", default: null },
        channel: { type: String, enum: ["retail", "wholeSale", "parlor"] },
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
        refundMethod: { type: String, enum: ["cash", "bank", "jazzCash", "easyPaisa", "creditNote"] },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("SaleReturns", saleReturnSchema);