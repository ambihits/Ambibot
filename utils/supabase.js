console.log("🔎 ENV VARS CHECK");
console.log("SUPABASE_URL:", process.env.SUPABASE_URL);
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY
);


async function storeRedemption({ key, discord_id, role, redeemed_at, expires_at }) {
  try {
    const { error } = await supabase
      .from("redemptions")
      .insert({ key, discord_id, role, redeemed_at, expires_at });

    if (error) {
      console.error("🔥 Supabase Insert Error:", error);
      return { error };
    }

    return { success: true };
  } catch (e) {
    console.error("❌ Failed to store redemption:", e);
    return { error: e };
  }
}

async function checkKeyUsed(key) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("key")
    .eq("key", key)
    .maybeSingle();

  if (error) {
    console.error("Error checking key usage:", error);
    return true; // fallback to assume used if check fails
  }

  return !!data;
}

async function getLicenseStatus(discordId) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("*")
    .eq("discord_id", discordId)
    .maybeSingle();

  if (error || !data) return { valid: false };

  const now = new Date();
  const expires = new Date(data.expires_at);
  const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));

  return {
    valid: expires > now,
    daysLeft,
    role: data.role,
    expires_at: data.expires_at
  };
}

async function updateExpiration(discordId, days) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("expires_at")
    .eq("discord_id", discordId)
    .single();

  if (error || !data) return { success: false };

  const newDate = new Date(data.expires_at);
  newDate.setDate(newDate.getDate() + days);

  const { error: updateError } = await supabase
    .from("redemptions")
    .update({ expires_at: newDate.toISOString() })
    .eq("discord_id", discordId);

  return { success: !updateError, newDate: newDate.toISOString() };
}

async function extendAllUsers(days) {
  const { data, error } = await supabase
    .from("redemptions")
    .select("discord_id, expires_at");

  if (error || !data) return { success: false };

  const updates = data.map(row => {
    const current = new Date(row.expires_at);
    const newExpires = new Date(current.setDate(current.getDate() + days)).toISOString();
    return { discord_id: row.discord_id, expires_at: newExpires };
  });

  const promises = updates.map(row =>
    supabase
      .from("redemptions")
      .update({ expires_at: row.expires_at })
      .eq("discord_id", row.discord_id)
  );

  await Promise.all(promises);
  return { success: true };
}

module.exports = {
  storeRedemption,
  checkKeyUsed,
  getLicenseStatus,
  updateExpiration,
  extendAllUsers
};
