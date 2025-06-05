import PDFDocument from "pdfkit";
import fs from "fs";
import QRCode from "qrcode";
import { promisify } from "util";

// Promisified unlink for deleting files asynchronously
const unlinkAsync = promisify(fs.unlink);

// Convert PhonePe transaction ID into readable timestamp format
const convertToTimestamp = (input) => {
    const dateTimePart = input.slice(1, 15);
    const year = parseInt("20" + dateTimePart.slice(0, 2), 10);
    const month = dateTimePart.slice(2, 4);
    const day = dateTimePart.slice(4, 6);
    const hour = dateTimePart.slice(6, 8);
    const minute = dateTimePart.slice(8, 10);
    return `${day}-${month}-${year} ${hour}:${minute}`;
};

/**
 * Generates an Admit Card PDF with pre-formatted layout and QR code for verification.
 */
const generateAdmitCard = async (
    merchantTransactionId,
    success,
    participantName,
    roll,
    aadhar,
    fatherName,
    motherName,
    schoolName,
    medium,
    group,
    grade,
    photoPath,
    pgResponse
) => {
    try {
        // Validate payment success
        if (!success || !pgResponse.success) {
            console.error(
                "Payment verification failed. Cannot generate admit card."
            );
            return "Payment not verified";
        }

        const timeOfExam =
            group === "A"
                ? "10:00AM - 11:30AM"
                : group === "B"
                ? "04:30PM - 6:00PM"
                : "";
        const gateCloseTime =
            group === "A" ? "09:30AM" : group === "B" ? "04:00PM" : "";

        const admitDate = convertToTimestamp(pgResponse.data.transactionId);
        const qrPath = `${merchantTransactionId}-qr.png`;
        const pdfPath = `${merchantTransactionId}.pdf`;

        // Encode essential info in QR
        const qrData = JSON.stringify({
            admitId: merchantTransactionId,
            txnId: pgResponse.data.transactionId,
            name: participantName,
            roll,
        });

        // Generate QR code image
        await QRCode.toFile(qrPath, qrData, {
            color: {
                dark: "#000000",
                light: "#fff", // transparent background
            },
        });

        // Create PDF
        const doc = new PDFDocument({
            layout: "portrait",
            size: "A4",
            margin: 0,
        });

        const stream = fs.createWriteStream(pdfPath);
        doc.pipe(stream);

        // Add your background template
        doc.image("quizchamp2.admitcard.png", 0, 0, { width: 590 });

        // Add identifiers at bottomest horizontal position
        doc.fontSize(8)
            .font("Times-Roman")
            .fillColor("black")
            .text(`${merchantTransactionId}`, 255, 780)
            .text(`${admitDate}`, 255, 790)
            .text(`${pgResponse.data.transactionId}`, 255, 800);

        // Add values at exact positions on template (no field names)
        doc.fontSize(11)
            .font("Helvetica-Bold")
            .text(participantName, 175, 188)
            .text(roll, 175, 220)
            .text(aadhar, 175, 253)
            .text(fatherName, 175, 285)
            .text(motherName, 175, 320)
            .text(`${schoolName.slice(0, 33)}.`, 175, 350)
            .text(medium, 175, 385)
            .text(`${group}-(${grade})`, 485, 385);

        // red text for exam time
        doc.fontSize(11)
            .font("Helvetica-Bold")
            .fillColor("red")
            .text(timeOfExam, 455, 159)
            .fontSize(16)
            .text(gateCloseTime, 160, 778);

        // Add QR to top-right
        doc.image(qrPath, 403, 641, {
            width: 167,
        });

        // Add participant photo try-catch if not worked let it be empty
        try {
            //check if photoPath exists if not skip adding photo
            if (!fs.existsSync(photoPath)) {
                console.warn(
                    "Photo path does not exist, skipping photo addition."
                );
            } else {
                doc.image(`.${photoPath}`, 395, 190, {
                    width: 150,
                    height: 170,
                });
            }
        } catch (err) {
            console.error("Error adding photo:", err);
            // Optionally add a placeholder or leave it empty
        }

        // Finalize PDF
        doc.end();

        await new Promise((resolve, reject) => {
            stream.on("finish", resolve);
            stream.on("error", reject);
        });

        return pdfPath;
    } catch (err) {
        console.error("Error generating admit card:", err);
        throw err;
    }
};

/**
 * Deletes the generated PDF and QR image for cleanup.
 */
const deleteFiles = async (merchantTransactionId) => {
    const pdfPath = `${merchantTransactionId}.pdf`;
    const qrPath = `${merchantTransactionId}-qr.png`;

    try {
        await Promise.all([unlinkAsync(pdfPath), unlinkAsync(qrPath)]);
        return "Files deleted successfully";
    } catch (err) {
        console.error("Error deleting files:", err);
        throw err;
    }
};

export { generateAdmitCard as generateCertificate, deleteFiles };
export default generateAdmitCard;
