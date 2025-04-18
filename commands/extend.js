const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const supabase = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("extend")
    .setDescription("Manually extend a user's license.")
    .addUserOption((option) =>
      option.setName("user").setDescription("User to extend").setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Number of days to extend")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const targetUser = interaction.options.getUser("user");
    const days = interaction.options.getInteger("days");

    const discord_id = targetUser?.id;
    const now = new Date();

    console.log(`🔧 /extend called for Discord ID: ${discord_id} with days: ${days}`);

    if (!discord_id || !days || days <= 0) {
      return interaction.reply({
        content: "❌ Invalid user or days value.",
        ephemeral: true,
      });
    }

    const new_expiration = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const { error } = await supabase.from("redemptions").insert({
      key: "manual-extend",
      discord_id,
      role: "Manual",
      redeemed_at: now.toISOString(),
      expires_at: new_expiration.toISOString(),
    });

    if (error) {
      console.error("❌ Supabase Extend Error:", error);
      return interaction.reply({
        content: "❌ Failed to extend the license.",
        ephemeral: true,
      });
    }

    await interaction.reply({
      content: `✅ Extended <@${discord_id}>'s license by **${days} days** (now expires on ${new_expiration.toLocaleString()}).`,
      ephemeral: true,
    });
  },
};
