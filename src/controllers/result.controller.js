import QuizChamp from "../models/quizchamp.model.js";

// Function to get the roll number and send the data
export const getParticipantData = async (req, res) => {
    try {
        const { roll } = req.body;

        // Find the quizchamp document with the given roll number
        const quizChamp = await QuizChamp.findOne({ roll });
        if (!quizChamp) {
            return res.status(404).json({ message: "Data not found" });
        }

        // Send the quizchamp data as a response
        res.status(200).json({
            success: true,
            message: "Data found",
            data: {
                roll: quizChamp.roll,
                name: quizChamp.name,
                merchantTransactionId: quizChamp.merchantTransactionId,
                attendance: quizChamp.attendance,
                fatherName: quizChamp.fatherName,
                motherName: quizChamp.motherName,
            },
        });
    } catch (error) {
        console.error("Error fetching roll number:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get participant data by roll number bulk
export const getParticipantDataBulk = async (req, res) => {
    try {
        const { rollNumbers } = req.body;

        // Validate rollNumbers
        if (!Array.isArray(rollNumbers) || rollNumbers.length === 0) {
            return res.status(400).json({ message: "Invalid roll numbers" });
        }

        // Find the quizchamp documents with the given roll numbers
        const quizChamps = await QuizChamp.find({ roll: { $in: rollNumbers } });
        if (quizChamps.length === 0) {
            return res.status(404).json({
                message: "No data found for the provided roll numbers",
            });
        }

        // Send the quizchamp data as a response
        res.status(200).json({
            success: true,
            message: "Data found",
            // data as roll : { name, merchantTransactionId, attendance, fatherName, motherName }
            data: quizChamps.reduce((acc, quizChamp) => {
                acc[quizChamp.roll] = {
                    name: quizChamp.name,
                    merchantTransactionId: quizChamp.merchantTransactionId,
                    attendance: quizChamp.attendance,
                    fatherName: quizChamp.fatherName,
                    motherName: quizChamp.motherName,
                };
                return acc;
            }, {}),
        });
    } catch (error) {
        console.error("Error fetching participant data bulk:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// get roll number with email
export const getRollNumberWithEmail = async (req, res) => {
    try {
        const { email } = req.body;

        // Find the quizchamp document with the given email
        const quizChamp = await QuizChamp.findOne({ email });
        if (!quizChamp) {
            return res.status(404).json({ message: "Data not found" });
        }

        // Send the quizchamp data as a response
        res.status(200).json({
            success: true,
            message: "Data found",
            data: {
                roll: quizChamp.roll,
                group: quizChamp.group,
            },
        });
    } catch (error) {
        console.error("Error fetching roll number with email:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Function to get the result of a quizchamp by roll number
