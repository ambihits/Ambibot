const { SlashCommandBuilder } = require("discord.js");
const supabase = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days remain on your license."),
  async execute(interaction) {
    const discordId = interaction.user.id;
    console.log(`📆 /daysleft called for Discord ID: ${discordId}`);

    try {
      const { data, error } = await supabase
        .from("redemptions")
        .select("*")
        .eq("discord_id", discordId)
        .order("expires_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase Error:", error);
        return interaction.reply({
          content: "There was a problem fetching your license.",
          ephemeral: true,
        });
      }

      if (!data || data.length === 0) {
        return interaction.reply({
          content: "No license was found for your Discord ID.",
          ephemeral: true,
        });
      }

      const latest = data[0];
      const now = new Date();
      const expires = new Date(latest.expires_at);
      const diffTime = expires - now;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      await interaction.reply({
        content: `⏳ You have **${daysLeft} days** left on your **${latest.role}** license.\n\n🗓️ Expires on: ${expires.toLocaleString()}`,
        ephemeral: true,
      });
    } catch (err) {
      console.error("❌ Unexpected Error in /daysleft:", err);
      return interaction.reply({
        content: "Unexpected error occurred while checking your license.",
        ephemeral: true,
      });
    }
  },
};
