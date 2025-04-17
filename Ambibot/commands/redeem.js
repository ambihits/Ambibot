const { SlashCommandBuilder } = require("discord.js");
const { validateKey } = require("../utils/keyStore");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a license key for access")
    .addStringOption(option =>
      option.setName("key")
        .setDescription("Enter your license key")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const key = interaction.options.getString("key");
    const userId = interaction.user.id;

    const valid = await validateKey(key);
    if (!valid) {
      return interaction.reply({ content: "❌ Invalid or already used key.", ephemeral: true });
    }

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "❌ Couldn't find your Discord ID in the server.", ephemeral: true });
    }

    const roleId = key.startsWith("TRIAL") ? process.env.ROLE_TRIAL : process.env.ROLE_ALL_ACCESS;
    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role);

    interaction.reply({ content: `✅ Key redeemed successfully! You've been granted the appropriate role.`, ephemeral: true });
  }
};
