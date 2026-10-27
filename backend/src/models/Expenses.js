import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        name: String,
        category: { type: String, enum:["electricity", "salary", "wifi", "software", "dailyBasic", "bonus", "rent", "shopMaintaince"] },
        date: Date,
        amount: Number,
        createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "Users"},
        updatedBy: {type: mongoose.Schema.Types.ObjectId, ref: "Users"},
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Expenses", expenseSchema);