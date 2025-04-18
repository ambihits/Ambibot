const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../utils/supabase");
const fs = require("fs");
const path = require("path");

const keyFilePath = path.join(__dirname, "..", "key.txt");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a license key.")
    .addStringOption((option) =>
      option
        .setName("key")
        .setDescription("The license key to redeem.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const key = interaction.options.getString("key").trim();
    const discord_id = interaction.user.id;
    const now = new Date();

    console.log(`🔑 /redeem called with key: ${key} for Discord ID: ${discord_id}`);

    if (!fs.existsSync(keyFilePath)) {
      return interaction.reply({
        content: "❌ License key store is missing.",
        ephemeral: true,
      });
    }

    const keyList = fs.readFileSync(keyFilePath, "utf-8").split(/\r?\n/).filter(Boolean);
    const keyExists = keyList.includes(key);

    console.log(`🔎 Key "${key}" found in list: ${keyExists}`);

    if (!keyExists) {
      return interaction.reply({
        content: "❌ This key is invalid or already used.",
        ephemeral: true,
      });
    }

    const role = key.startsWith("TRIAL-") ? "Trial" : "Premium";
    const expires_at = new Date(now.getTime() + (role === "Trial" ? 3 : 30) * 24 * 60 * 60 * 1000);

    const payload = {
      key,
      discord_id,
      role,
      redeemed_at: now.toISOString(),
      expires_at: expires_at.toISOString(),
    };

    console.log("🚀 Inserting into Supabase:", JSON.stringify(payload, null, 2));

    const { error } = await supabase.from("redemptions").insert(payload);

    if (error) {
      console.error("🔥 Supabase Insert Error:", error);
      return interaction.reply({
        content: "❌ Failed to store redemption.",
        ephemeral: true,
      });
    }

    // Remove key from file
    fs.writeFileSync(
      keyFilePath,
      keyList.filter((k) => k !== key).join("\n")
    );

    await interaction.reply({
      content: `✅ Key redeemed successfully! You now have a **${role}** license until **${expires_at.toLocaleString()}**.`,
      ephemeral: true,
    });
  },
};
