/**
 * 🔹 Fixed-width padding (used for terminal table logs)
 */
function pad(str, len) {
    str = String(str || "");
    return str.length > len
        ? str.slice(0, len - 3) + "..."
        : str.padEnd(len);
}

module.exports = pad