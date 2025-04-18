const { SlashCommandBuilder } = require("discord.js");
const { getSupabaseClient } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Extend a user's license.")
    .addUserOption(option =>
      option.setName("user").setDescription("User to extend").setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("days").setDescription("Number of days to extend").setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const days = interaction.options.getInteger("days");

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("valid_keys")
      .select("*")
      .eq("discord_id", user.id)
      .maybeSingle();

    if (error || !data) {
      return interaction.reply({
        content: `⚠️ Failed to find license for <@${user.id}>.`,
        ephemeral: true
      });
    }

    const newExpiration = new Date(data.expires_at);
    newExpiration.setDate(newExpiration.getDate() + days);

    const { error: updateError } = await supabase
      .from("valid_keys")
      .update({ expires_at: newExpiration.toISOString() })
      .eq("discord_id", user.id);

    if (updateError) {
      return interaction.reply({
        content: `⚠️ Failed to update license: ${updateError.message}`,
        ephemeral: true
      });
    }

    return interaction.reply({
      content: `✅ Extended <@${user.id}>'s license by ${days} days. New expiration: <t:${Math.floor(newExpiration.getTime() / 1000)}:R>.`,
      ephemeral: true
    });
  },
};

