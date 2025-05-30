import axios from "axios";

const SIGNAL_URL = "https://signal.callmebot.com/signal/send.php";
const PHONE = "6f69ad54-55ba-46b8-af08-d68a0026e809";
const API_KEY = "753348";

let logBuffer = [];
let sendTimer = null;
const DEBOUNCE_TIME = 10 * 60 * 1000; // 10 minutes

const flushLogs = async () => {
    if (logBuffer.length === 0) return;

    // Add numbering
    const combinedMessage = logBuffer
        .map((log, index) => `${index + 1}. ${log}`)
        .join("\n---\n");

    logBuffer = []; // Clear the buffer

    try {
        await axios.get(SIGNAL_URL, {
            params: {
                phone: PHONE,
                apikey: API_KEY,
                text: combinedMessage.slice(0, 1000), // Optional size limit
            },
            validateStatus: () => true, // Prevent throwing on non-200
        });
    } catch (err) {
        // Silent catch
    }
};

const scheduleFlush = () => {
    if (!sendTimer) {
        sendTimer = setTimeout(() => {
            flushLogs().finally(() => {
                sendTimer = null;
            });
        }, DEBOUNCE_TIME);
    }
};

const sendMobileLog = async (message) => {
    if (typeof message !== "string") message = String(message);
    logBuffer.push(`[${new Date().toISOString()}] ${message}`);
    scheduleFlush();
};

const sendMobileLogWithError = async (error) => {
    if (typeof error !== "string") error = String(error);
    const message = `Error: ${error}`;
    return sendMobileLog(message);
};

export { sendMobileLog, sendMobileLogWithError };
