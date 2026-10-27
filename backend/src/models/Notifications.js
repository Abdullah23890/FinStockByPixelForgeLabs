import mongoose, { mongo } from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        type : { type: String, enum: ["lowStock", "expiry", "duePayment"] },
        refrenceId : { type: mongoose.Schema.Types.ObjectId },
        message : String,
        isRead : { type: String, enum: ["read", "unRead"] }
    },
    {
        timestamps : true
    }
);

export default mongoose.model("Notifications", notificaitonSchema);