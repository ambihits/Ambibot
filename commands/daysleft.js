const { SlashCommandBuilder } = require("discord.js");
const { getSupabaseClient } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license"),

  async execute(interaction) {
    try {
      const discordId = interaction.user.id;
      console.log(`📆 /daysleft called for Discord ID: ${discordId}`);

      const supabase = getSupabaseClient();

      const { data, error } = await supabase
        .from("redemptions")
        .select("expires_at")
        .eq("discord_id", discordId)
        .single();

      if (error || !data) {
        console.error("❌ Supabase Error:", error);
        return interaction.reply({
          content: "Could not find a license associated with your Discord account.",
          ephemeral: true,
        });
      }

      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)));

      return interaction.reply({
        content: `Your license expires on **${expiresAt.toDateString()}**.\nYou have **${daysLeft} day(s)** left.`,
        ephemeral: true,
      });
    } catch (err) {
      console.error("⚠️ Error executing /daysleft:", err);
      return interaction.reply({
        content: "An unexpected error occurred while checking your license.",
        ephemeral: true,
      });
    }
  },
};


