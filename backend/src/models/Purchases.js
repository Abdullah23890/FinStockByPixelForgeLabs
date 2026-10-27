import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
    {
        purchaseNumber : String,
        supplier : { type: mongoose.Schema.Types.ObjectId, ref: "Suppliers" },
        purchaseDate : Date,
        items : [
            {
                product : { type: mongoose.Schema.Types.ObjectId, ref: "Products" },
                batchId : { type: mongoose.Schema.Types.ObjectId, ref: "Batches" },
                batchNo : String,
                expiryDate : Date,
                quantity : Number,
                returnQuantity: Number,
                purchasePrice : Number,
                returnAmount: Number,
            }
        ],
        payment : [
            {
                amount : Number,
                paymentDate : { type: Date, default: Date.now },
                paymentMethod : { type: String, enum: ["easyPaisa", "jazzCash", "bank", "cash", "creditNote"] },
                creditNote: { type: mongoose.Schema.Types.ObjectId, ref: "SupplierCreditNotes" },
                refrence : String,
                notes : String,
                createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
            }
        ],
        totalAmount : { type: Number, default: 0},
        paidAmount : { type: Number, default: 0},
        remainingAmount : { type: Number, default: 0},
        totalReturnAmount: { type: Number, default: 0},
        netAmount: { type: Number, default: 0},
        cashRefundAmount: { type: Number, default: 0},
        creditNoteAmount: { type: Number, default: 0},
        status : { type: String, enum: ["paid", "unPaid", "partial"] },
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Purchases", purchaseSchema);