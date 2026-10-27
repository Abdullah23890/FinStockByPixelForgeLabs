import mongoose from "mongoose";

const categoriesSchema = new mongoose.Schema(
    {
        name : {type: String, unique: true},
        createdBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
        updatedBy : { type: mongoose.Schema.Types.ObjectId, ref: "Users" }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Categories", categoriesSchema);