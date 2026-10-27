import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name : String,
        type : { type: String, enum: ["retail", "wholeSale", "parlor"] },
        contactNo : String,
        address : String,
        creditLimit : Number,
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Customers", customerSchema);