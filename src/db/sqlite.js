const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

/**
 * 🔹 Ensure storage directory exists
 * This prevents crashes if folder is missing
 */
const storageDir = path.join(__dirname, "../../storage");

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
}

/**
 * 🔹 Database file path
 */
const dbPath = path.join(storageDir, "logs.db");

/**
 * 🔹 Initialize SQLite database
 * better-sqlite3 is synchronous and fast
 */
const db = new Database(dbPath);

/**
 * 🔹 Performance optimizations
 *
 * WAL → better concurrency (reads + writes)
 * NORMAL → faster writes (slightly less strict than FULL)
 */
db.pragma("journal_mode = WAL");
db.pragma("synchronous = NORMAL");

/**
 * 🔹 Create logs table if not exists
 */
db.exec(`
  CREATE TABLE IF NOT EXISTS request_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    method TEXT,
    url TEXT,
    ip TEXT,
    headers TEXT,
    body TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

/**
 * 🔹 Index for faster sorting (latest logs first)
 */
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_created_at 
  ON request_logs(created_at);
`);

/**
 * 🔹 Recommended additional indexes
 * These help when filtering/searching later
 */
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_method 
  ON request_logs(method);
`);

db.exec(`
  CREATE INDEX IF NOT EXISTS idx_url 
  ON request_logs(url);
`);

/**
 * 🔹 Export DB instance (singleton)
 */
module.exports = db;