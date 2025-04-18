const { SlashCommandBuilder } = require("discord.js");
const { getSupabaseClient } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daysleft")
    .setDescription("Check how many days are left on your license."),

  async execute(interaction) {
    const discord_id = interaction.user.id;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("valid_keys")
      .select("expires_at")
      .eq("discord_id", discord_id)
      .maybeSingle();

    if (error || !data) {
      return interaction.reply({
        content: "❌ Could not find your license. Please redeem a key first.",
        ephemeral: true
      });
    }

    const now = new Date();
    const expiration = new Date(data.expires_at);
    const diffDays = Math.ceil((expiration - now) / (1000 * 60 * 60 * 24));

    return interaction.reply({
      content: `📆 You have ${diffDays} day(s) left. License expires <t:${Math.floor(expiration.getTime() / 1000)}:R>.`,
      ephemeral: true
    });
  },
};

