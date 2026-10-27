import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema(
    {
        name : String,
        contactNo : String,
        address : String,
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Suppliers", supplierSchema);