const express = require("express");
const db = require("../db/sqlite");

const router = express.Router();

/**
 * GET /api/logs
 *
 * 🔹 Purpose:
 * Fetch request logs from SQLite with optional filtering + pagination
 *
 * 🔹 Query params:
 *  - limit   → number of records (default: 100, max: 500)
 *  - offset  → pagination offset (default: 0)
 *  - method  → filter by HTTP method (GET, POST, etc)
 *  - search  → text search in URL or body
 */
router.get("/api/logs", (req, res) => {
  try {
    // 🔹 Extract query params with defaults
    let { limit = 100, offset = 0, method, search } = req.query;

    /**
     * 🔹 Sanitize inputs
     * - Ensure limit is a number and capped to 500 (prevent heavy queries)
     * - Ensure offset is a number
     */
    limit = Math.min(parseInt(limit) || 100, 500);
    offset = parseInt(offset) || 0;

    /**
     * 🔹 Base SQL query
     * WHERE 1=1 allows easy dynamic condition appending
     */
    let query = `
      SELECT id, method, url, ip, headers, body, created_at
      FROM request_logs
      WHERE 1=1
    `;

    const params = [];

    /**
     * 🔹 Filter by HTTP method (if provided)
     * Example: /api/logs?method=POST
     */
    if (method) {
      query += " AND method = ?";
      params.push(method.toUpperCase());
    }

    /**
     * 🔹 Search in URL or body
     * Uses LIKE for partial matching
     * Example: /api/logs?search=login
     */
    if (search) {
      query += " AND (url LIKE ? OR body LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    /**
     * 🔹 Add ordering + pagination
     * - Latest logs first (ORDER BY id DESC)
     * - LIMIT + OFFSET for paging
     */
    query += " ORDER BY id DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    /**
     * 🔹 Prepare + execute query
     * better-sqlite3 executes synchronously
     */
    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    /**
     * 🔹 Send response
     * - count = number of records returned (not total in DB)
     */
    res.json({
      count: rows.length,
      limit,
      offset,
      data: rows,
    });

  } catch (err) {
    console.error("Logs API error:", err.message);

    res.status(500).json({
      error: "Failed to fetch logs",
    });
  }
});

module.exports = router;