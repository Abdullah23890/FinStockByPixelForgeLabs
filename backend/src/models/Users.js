import mongoose from "mongoose";

const usersSchema = new mongoose.Schema(
    {
        name : String,
        userName : { type: String, unique: true, required: true },
        password : String,
        role : { type: String, enum: ["admin", "saleManager", "counter"] },
        phone : String,
        status : { type: String, enum: ["active", "resigned"] },
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Users", usersSchema);