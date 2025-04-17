const express = require("express");
const router = express.Router();
const { supabase } = require("../utils/supabase");

router.get("/check-license/:discord_id", async (req, res) => {
  const { discord_id } = req.params;

  console.log(`🔍 Checking license for Discord ID: ${discord_id}`);

  try {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("discord_id", discord_id)
      .order("redeemed_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("❌ Supabase query error:", error);
      return res.status(500).json({ valid: false, message: "Supabase error." });
    }

    if (!data || data.length === 0) {
      console.log("🚫 No redemption found.");
      return res.status(404).json({ valid: false, message: "License not found." });
    }

    const record = data[0];
    const now = new Date();
    const expires = new Date(record.expires_at);

    if (now > expires) {
      console.log("⏳ License expired.");
      return res.status(403).json({ valid: false, message: "License expired." });
    }

    console.log("✅ License valid.");
    return res.json({ valid: true, role: record.role, expires_at: record.expires_at });

  } catch (err) {
    console.error("🔥 Unknown error:", err);
    return res.status(500).json({ valid: false, message: "Server error." });
  }
});

module.exports = router;
