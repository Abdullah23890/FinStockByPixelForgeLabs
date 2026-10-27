import mongoose from "mongoose";

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connect DB!");
    } catch (error) {
        console.log("DB Connection Field!");
        console.log(error);
        process.exit(1);
    }
}

export default connectDB;