const express = require("express");
const path = require("path");

// 🔹 Initialize DB once (creates table, indexes, etc.)
require("./src/db/sqlite");

// 🔹 Middleware + routes
const loggerMiddleware = require("./src/middleware/logger");
const logsApi = require("./src/routes/logsapi");

// 🔹 Utility functions
const getLocalIPs = require("./src/utils/getlocalips")
const pad = require("./src/utils/pad")

const app = express();

/**
 * 🔹 PORT priority:
 * 1. CLI arg → node server.js 4000
 * 2. ENV → TESTEXPRESSSERVER
 * 3. Default → 3000
 */
const PORT = process.argv[2] || process.env.TESTEXPRESSSERVER || 3000;

/**
 * 🔹 Bind to all interfaces (LAN + localhost)
 */
const HOST = "0.0.0.0"

/**
 * 🔹 Trust proxy (useful if behind nginx / cloudflare)
 */
app.set("trust proxy", true);

/**
 * IMPORTANT ORDER
 * Logger must come BEFORE body parsers
 * so raw body can be captured
 */
app.use(loggerMiddleware);

/**
 * 🔹 Body parsers (AFTER logger)
 */
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

/**
 * 🔹 API routes
 */
app.use(logsApi);

/**
 * 🔹 Dashboard UI
 */
app.get("/logs", (req, res) => {
    res.sendFile(path.join(__dirname, "src", "dashboard", "index.html"));
});

/**
 * 🔹 Health check endpoint
 */
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

/**
 * 🔹 Catch-all route
 * (still gets logged by middleware)
 */
app.use((req, res) => {
    res.status(200).json({
        message: "Status good",
        active: true,
        path: req.originalUrl,
    });
});

/**
 * 🔹 Start server
 */
app.listen(PORT, HOST, () => {

    console.log(`Server running:`);
    console.log();

    // 🔹 Print all accessible URLs
    getLocalIPs().forEach(ip => {
        console.log(`\thttp://${ip}:${PORT}`);
    });


    /**
     * 🔹 Print table header (for request logs)
     * This aligns with logger middleware output
     */
    console.log("-".repeat(90));
    console.log(
        pad("METHOD", 8) +
        pad("ENDPOINT", 30) +
        pad("FROM", 18) +
        "BODY"
    );
    console.log("-".repeat(90));
});