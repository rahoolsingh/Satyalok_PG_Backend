import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true,
            lowercase: true,
            match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            // Regex to validate email format
        },
        name: {
            type: String,
            trim: true,
            maxlength: 100,
            // Name should be a string, trimmed, and not exceed 100 characters
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
            maxlength: 100,
            // Passwords should be hashed before saving
        },
        token: {
            type: String,
            unique: true,
            // Tokens should be unique and required for authentication
        },

        // devices: [
        //     {
        //         deviceId: {
        //             type: String,
        //             required: true,
        //             unique: true,
        //             // Unique identifier for the device
        //         },
        //         lastUsed: {
        //             type: Date,
        //             default: Date.now,
        //             // Timestamp of the last time the device was used
        //         },
        //     },
        // ],
    },
    {
        timestamps: true,
        // Automatically manage createdAt and updatedAt fields
    }
);

// remove sensitive information before json serialization
adminSchema.methods.toJSON = function () {
    const admin = this;
    const adminObject = admin.toObject();

    // Remove sensitive fields
    delete adminObject.password;
    delete adminObject.token;

    return adminObject;
};

// Middleware to hash password before saving
adminSchema.pre("save", async function (next) {
    const admin = this;

    // Only hash the password if it has been modified (or is new)
    if (admin.isModified("password")) {
        admin.password = await bcrypt.hash(admin.password, 10);
    }
    next();
});

// Method to compare password
adminSchema.methods.comparePassword = async function (candidatePassword) {
    const admin = this;
    return await bcrypt.compare(candidatePassword, admin.password);
};

// Method to generate authentication token
adminSchema.methods.generateAuthToken = function () {
    const admin = this;
    // Generate a token using the admin's ID and a secret key
    const token = jwt.sign(
        { _id: admin._id.toString() },
        process.env.JWT_ADMIN_SECRET,
        {
            expiresIn: "7d", // Token expires in 7 days 
        }
    );
    return token;
};

// method to verify token
adminSchema.statics.verifyToken = async function (token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET);
        return decoded;
    } catch (error) {
        throw new Error("Invalid token");
    }
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
