import mongoose from "mongoose";

const settingSchema = new mongoose.Schema(
    {
        name : String,
        logo : String,
        address : String,
        phone : String,
        printfooterText : String
    },
    {
        timestamps: true
    }
);

export default mongoose.model("Settings", settingSchema);