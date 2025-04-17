const fs = require("fs");
const path = require("path");

const KEYS_FILE = path.resolve(__dirname, "../keys.txt");

function readKeysFile() {
  try {
    console.log("🔍 Attempting to read:", KEYS_FILE);

    const data = fs.readFileSync(KEYS_FILE, "utf-8");
    console.log("📄 keys.txt contents:\n" + data);

    return data
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (err) {
    console.error("❌ Failed to read keys.txt:", err.message);
    return [];
  }
}

function checkKeyUsed(key) {
  const keys = readKeysFile();
  const result = keys.includes(key);
  console.log(`🔎 Key "${key}" found in list:`, result);
  return !result;
}

module.exports = {
  checkKeyUsed,
};
