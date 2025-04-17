const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function storeRedemption({ key, discord_id, role, redeemed_at, expires_at }) {
  const payload = { key, discord_id, role, redeemed_at, expires_at };

  console.log("🚀 Inserting into Supabase:", JSON.stringify(payload, null, 2));

  const { error } = await supabase.from("redemptions").insert([payload]);

  if (error) {
    console.error("🔥 Supabase Insert Error:", JSON.stringify(error, null, 2));
  }

  return { error };
}

module.exports = { storeRedemption };
