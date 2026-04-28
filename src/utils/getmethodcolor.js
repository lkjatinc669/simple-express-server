/**
 * 🔹 ANSI colors for terminal output
 */
const colors = {
    reset: "\x1b[0m",
    gray: "\x1b[90m",
    green: "\x1b[32m",
    blue: "\x1b[34m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m",
};

/**
 * 🔹 Color per HTTP method
 */
function getMethodColor(method) {
    switch (method) {
        case "GET": return colors.green;
        case "POST": return colors.blue;
        case "PUT": return colors.yellow;
        case "DELETE": return colors.red;
        default: return colors.cyan;
    }
}

module.exports = getMethodColor