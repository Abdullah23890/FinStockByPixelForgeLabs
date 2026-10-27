import mongoose from "mongoose";

const batchSchema = new mongoose.Schema(
    {
        purchaseId : { type: mongoose.Schema.Types.ObjectId, ref: "Purchases" },
        product : {type: mongoose.Schema.Types.ObjectId, ref: "Products" },
        batchNo : String,
        // expiryDate : Date,
        quantity : Number,
        purchasePrice : Number,
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Batches", batchSchema);