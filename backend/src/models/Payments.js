import mongoose, { mongo } from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        paymentNo : String,
        customer : { type: mongoose.Schema.Types.ObjectId, ref: "Customers" },
        sale : { type: mongoose.Schema.Types.ObjectId, ref: "Sales" },
        amount : Number,
        paymentDate : Date,
        paymentMetod : { type: String, enum: ["easyPaisa", "jazzCash", "bank", "cash"] },
        notes : String,
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Payments", paymentSchema);