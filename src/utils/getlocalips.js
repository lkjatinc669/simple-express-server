const os = require("os");

/**
 * 🔹 Get all IPv4 addresses from network interfaces
 *
 * Returns:
 *  - Array of IPs (e.g. ["192.168.1.10", "10.0.0.5"])
 */
const getLocalIPs = () => {
  const nets = os.networkInterfaces();
  const results = [];

  // 🔹 Iterate over all network interfaces (eth0, wlan0, etc.)
  for (const name of Object.keys(nets)) {

    // Each interface can have multiple addresses
    for (const net of nets[name]) {

      /**
       * 🔹 Filter conditions:
       * - IPv4 only (skip IPv6)
       */
      if (net.family === "IPv4") {
        results.push(net.address);
      }
    }
  }

  return results;
};

module.exports = getLocalIPs;