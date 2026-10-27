import mongoose from "mongoose";

const developerSchema = new mongoose.Schema(
    {
        name : String,
        tagLine : String,
        email : String,
        phone : String,
        services : String,
        website : String
    }
);

export default mongoose.model("Developer", developerSchema);