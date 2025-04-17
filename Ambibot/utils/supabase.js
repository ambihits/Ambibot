const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function redeemKey(key, discord_id, role) {
  const duration = role === "Trial" ? 3 : 30;
  const now = new Date();
  const expires = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from("redemptions")
    .insert([
      {
        key,
        discord_id,
        role,
        redeemed_at: now.toISOString(),
        expires_at: expires.toISOString()
      }
    ]);

  return { data, error };
}

async function checkKeyUsed(key) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("key")
    .eq("key", key)
    .maybeSingle();

  return !!data;
}

async function getDaysLeft(discord_id) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("expires_at")
    .eq("discord_id", discord_id)
    .order("redeemed_at", { ascending: false })
    .maybeSingle();

  if (!data || !data.expires_at) return null;

  const now = new Date();
  const expires = new Date(data.expires_at);
  const msLeft = expires - now;
  const daysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));

  return daysLeft;
}

module.exports = {
  redeemKey,
  checkKeyUsed,
  getDaysLeft
};
