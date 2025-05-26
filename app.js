import express from "express";
import dotenv from "dotenv";
import {
    checkStatus,
    initiatePayment,
    initiateQuizChampPayment,
    paymentConfirmation,
    processPayment,
} from "./src/controllers/payment.controller.js";
import cors from "cors";
import connectDB from "./src/db/index.js";
import { donationReceiptEmailTemplate } from "./src/services/emailTemplate.js";
import fileUpload from "./src/middleware/fileUpload.middleware.js";
import { sendEmailVerificationOTP, verifyEmailOTP, verifyToken } from "./src/controllers/verification.controller.js";

const app = express();

dotenv.config();
app.use(
    cors({
        origin: [process.env.CORS_URLS.split(",")],
        methods: "GET,POST",
    })
);

console.log("CORS enabled for:", process.env.CORS_URLS.split(","));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 8000;

app.get("/", (req, res) => {
    if (req.query.text) {
        return res.send(`Hello, ${req.query.text}!`);
    }
    res.status(200).send({
        message: "Johar",
        commitVersion: process.env.RENDER_GIT_COMMIT,
        alive: true,
    });
});

app.post("/order", initiatePayment);

app.post("/quizChampOrder", verifyToken, fileUpload, initiateQuizChampPayment);

app.post("/process-payment", processPayment);

app.get("/status", checkStatus);

app.get("/confirmation", paymentConfirmation);

app.post("/send-verification-code", sendEmailVerificationOTP);

app.post("/verify-code", verifyEmailOTP);



// app.get("/emailTemplate", (req, res) => {
//     res.send(
//         donationReceiptEmailTemplate(
//             100,
//             "123456",
//             "2021-09-01",
//             "123456",
//             "PhonePe",
//             "John Doe",
//             true
//         )
//     );
// });

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}: http://localhost:${PORT}`);
    });
});
