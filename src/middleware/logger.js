const db = require("../db/sqlite");

// 🔹 Utility functions
const {colors, getMethodColor} = require("../utils/getmethodcolor")
const pad = require("../utils/pad")
const compactBody = require("../utils/compactbody")

/**
 * 🔹 Prepared statement (fast, reusable)
 */
const insertStmt = db.prepare(`
  INSERT INTO request_logs (method, url, ip, headers, body)
  VALUES (?, ?, ?, ?, ?)
`);

function loggerMiddleware(req, res, next) {
    const url = req.originalUrl || "";

    /**
     * 🔹 Skip internal routes (avoid noise)
     */
    const SKIP_PATHS = ["/logs", "/api/logs", "/health"];

    if (SKIP_PATHS.some(p => url.startsWith(p))) {
        return next();
    }

    let chunks = [];

    /**
     * 🔹 Capture raw request body
     */
    req.on("data", (chunk) => {
        chunks.push(chunk);
    });

    req.on("end", () => {
        const rawBody = Buffer.concat(chunks).toString();

        /**
         * 🔹 Limit stored body size (avoid huge DB rows)
         */
        const MAX_BODY = 50000;

        const safeBody =
            rawBody.length > MAX_BODY
                ? rawBody.slice(0, MAX_BODY) + "...[TRUNCATED]"
                : rawBody;

        /**
         * 🔹 Console log (table-style single line)
         */
        const methodColor = getMethodColor(req.method);

        const row =
            methodColor + pad(req.method, 8) + colors.reset +
            pad(req.originalUrl, 30) +
            pad(req.ip, 18) +
            compactBody(safeBody).slice(0, 80);

        console.log(row);

        /**
         * 🔹 Save to DB
         */
        try {
            insertStmt.run(
                req.method,
                req.originalUrl,
                req.ip,
                JSON.stringify(req.headers),
                safeBody
            );
        } catch (err) {
            console.error("DB insert error:", err.message);
        }

        /**
         * 🔹 IMPORTANT FIX:
         * Restore body so Express can still read it later
         */
        req.body = rawBody;

        next();
    });
}

module.exports = loggerMiddleware;
