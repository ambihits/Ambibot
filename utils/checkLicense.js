const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

router.get("/check-license/:discord_id", async (req, res) => {
  const { discord_id } = req.params;

  console.log(`🔍 Received license check for Discord ID: ${discord_id}`);

  try {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("discord_id", discord_id)
      .order("redeemed_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("❌ Supabase query error:", error.message);
      return res.status(500).json({ valid: false, message: "Supabase query error." });
    }

    if (!data || data.length === 0) {
      console.log("🚫 No license found in Supabase for this user.");
      return res.status(404).json({ valid: false, message: "License not found." });
    }

    const license = data[0];
    const now = new Date();
    const expires = new Date(license.expires_at);
    const valid = now < expires;
    const msRemaining = expires - now;
    const daysLeft = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60 * 24)));

    console.log(`✅ License ${valid ? "is valid" : "has expired"}. Days left: ${daysLeft}`);

    return res.json({
      valid,
      role: license.role,
      daysLeft,
      expires_at: license.expires_at,
      message: valid ? "License is valid." : "License expired."
    });

  } catch (err) {
    console.error("🔥 Unknown error in license check:", err.message);
    return res.status(500).json({ valid: false, message: "Internal server error." });
  }
});

module.exports = router;
