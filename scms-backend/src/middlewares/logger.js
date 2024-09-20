import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);
const logger = (req, res, next) => {
    const logFilePath = path.join(__dirname, "../utils/logs/logger.txt");

    // Log request details
    const requestLog = `
  --- Incoming Request ---
  Timestamp: ${new Date().toISOString()}
  Method: ${req.method}
  URL: ${req.originalUrl}
  Query Params: ${JSON.stringify(req.query)}
  URL Params: ${JSON.stringify(req.params)}
  Body: ${JSON.stringify(req.body)}
  Headers: ${JSON.stringify(req.headers)}
  -------------------------
  `;

    // Override res.send to log response data
    const originalSend = res.send;
    res.send = function (data) {
        // Log response details
        const responseLog = `
  --- Outgoing Response ---
  Timestamp: ${new Date().toISOString()}
  Response Data: ${data}
  -------------------------
  `;

        // Append request and response logs to the file
        fs.appendFileSync(logFilePath, requestLog + responseLog);

        // Call the original res.send with the response data
        originalSend.call(this, data);
    };

    next();
};
export default logger;
