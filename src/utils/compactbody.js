/**
 * 🔹 Compact body (1-line JSON if possible)
 */
function compactBody(body) {
    if (!body) return "";
    try {
        return JSON.stringify(JSON.parse(body));
    } catch {
        return body;
    }
}

module.exports = compactBody