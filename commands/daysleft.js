const { SlashCommandBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license."),

  async execute(interaction) {
    const discord_id = interaction.user.id;
    console.log(`📆 /daysleft called for Discord ID: ${discord_id}`);

    const { data, error } = await supabase
      .from("redemptions")
      .select("expires_at, role")
      .eq("discord_id", discord_id)
      .order("expires_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      console.error("❌ Supabase Error:", error || "No data returned");
      return interaction.reply({
        content: "License not found. Please use `/redeem` to register a key.",
        ephemeral: true,
      });
    }

    const expiresAt = new Date(data.expires_at);
    const now = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.max(0, Math.floor((expiresAt - now) / msPerDay));

    await interaction.reply({
      content: `🕒 Your ${data.role} license expires in **${daysLeft} day(s)**.`,
      ephemeral: true,
    });
  },
};


