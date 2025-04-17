const fs = require("fs");
const path = require("path");

// Adjust path as needed
const KEYS_FILE = path.resolve(__dirname, "../../keys.txt");

function readKeysFile() {
  try {
    const data = fs.readFileSync(KEYS_FILE, "utf-8");
    return data
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  } catch (error) {
    console.error("Failed to read keys file:", error.message);
    return [];
  }
}

function checkKeyUsed(key) {
  const keys = readKeysFile();
  return !keys.includes(key);
}

module.exports = {
  checkKeyUsed,
};
