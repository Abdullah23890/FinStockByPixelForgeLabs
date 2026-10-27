import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        name : String,
        category : { type: mongoose.Schema.Types.ObjectId, ref: "Categories" },
        barcode : { type: String, unique: true },
        retailPrice : Number,
        wholesalePrice : Number,
        parlorPrice : Number,
        status : { type: String, enum:["active", "inActive"] },
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Products", productSchema);