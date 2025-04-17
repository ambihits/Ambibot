const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function storeRedemption({ key, discord_id, role, redeemed_at, expires_at }) {
  const payload = { key, discord_id, role, redeemed_at, expires_at };

  console.log("🚀 Inserting into Supabase:", JSON.stringify(payload, null, 2));

  const { error, data, status, statusText } = await supabase
    .from("redemptions")
    .insert(payload);

  if (error) {
    console.error("🔥 Supabase Insert Error:", JSON.stringify(error, null, 2));
    console.error("⚠️ Status:", status, "|", statusText);
    return { error };
  }

  console.log("✅ Successfully inserted row:", JSON.stringify(data, null, 2));
  return { error: null };
}

module.exports = { storeRedemption };
