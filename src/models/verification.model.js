import mongoose from "mongoose";

const verificationSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: "10m", // OTP expires after 10 minutes
    },
});
const Verification = mongoose.model("Verification", verificationSchema);
export default Verification;
