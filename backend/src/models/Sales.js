import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
    {
        saleNumber: { type: String, required: true, unique: true },
        customerType: { type: String, enum: ["walkIn", "registered"], required: true },
        channel: { type: String, enum: ["retail", "wholeSale", "parlor"], required: true },
        customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customers", default: null },
        saleDate: { type: Date, required: true },
        items: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Products", required: true },
                batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batches", required: true },
                quantity: { type: Number, required: true },
                returnQuantity: { type: Number, default: 0 },
                unitPrice: { type: Number, required: true },
                purchasePrice: { type: Number, default: 0 },
                discount: { type: Number, default: 0 },
                total: { type: Number, required: true },
                returnAmount: { type: Number, default: 0 },
                profit: { type: Number, default: 0 }
            }
        ],
        payment: [
            {
                amount: { type: Number, required: true },
                paymentDate: { type: Date, default: Date.now },
                paymentMethod: { type: String, enum: ["easyPaisa", "jazzCash", "bank", "cash", "creditNote"], required: true },
                refrence: String,
                notes: String,
                creditNote: { type: mongoose.Schema.Types.ObjectId, ref: "CreditNotes", default: null },
                createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
            }
        ],
        subTotal: { type: Number, required: true },
        discount: { type: Number, default: 0 },
        tax: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
        paidAmount: { type: Number, default: 0 },
        dueAmount: { type: Number, default: 0 },
        totalReturnAmount: { type: Number, default: 0 },
        netAmount: { type: Number, default: 0 },
        cashRefundAmount: { type: Number, default: 0 },
        creditNoteAmount: { type: Number, default: 0 },
        status: { type: String, enum: ["paid", "partial", "unPaid"], default: "unPaid" },
        printSize: { type: String, enum: ["thermal", "a4"], default: "thermal" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Sales", saleSchema);