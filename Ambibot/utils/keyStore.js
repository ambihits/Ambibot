const fetch = require("node-fetch");

async function validateKey(key) {
  try {
    const res = await fetch(process.env.KEYS_URL);
    const data = await res.text();

    const keys = data.split(/\r?\n/).map(k => k.trim());
    return keys.includes(key.trim());
  } catch (err) {
    console.error("Key validation failed:", err);
    return false;
  }
}

module.exports = { validateKey };

