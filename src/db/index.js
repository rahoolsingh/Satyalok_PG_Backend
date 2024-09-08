import mongoose from "mongoose";

const DB_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed");
        process.exit(1);
    }
};

export default connectDB;
