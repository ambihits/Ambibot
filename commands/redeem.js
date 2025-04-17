const { SlashCommandBuilder } = require("discord.js");
const { validateKey } = require("../utils/keyStore");
const { redeemKey, checkKeyUsed } = require("../utils/supabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("redeem")
    .setDescription("Redeem a license key for access")
    .addStringOption(option =>
      option.setName("key")
        .setDescription("Your license key")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    const key = interaction.options.getString("key");
    const userId = interaction.user.id;

    const alreadyUsed = await checkKeyUsed(key);
    if (alreadyUsed) {
      return interaction.reply({ content: "❌ That key has already been redeemed.", ephemeral: true });
    }

    const valid = await validateKey(key);
    if (!valid) {
      return interaction.reply({ content: "❌ Invalid license key.", ephemeral: true });
    }

    const roleName = key.startsWith("TRIAL") ? "Trial" : "Premier User";
    const roleId = key.startsWith("TRIAL")
      ? process.env.ROLE_TRIAL
      : process.env.ROLE_ALL_ACCESS;

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) {
      return interaction.reply({ content: "❌ Unable to fetch your Discord profile in the server.", ephemeral: true });
    }

    const { error } = await redeemKey(key, userId, roleName);
    if (error) {
      console.error("Supabase error during redemption:", error);
      return interaction.reply({ content: "❌ There was a problem saving your key. Please try again later.", ephemeral: true });
    }

    const role = guild.roles.cache.get(roleId);
    if (role) await member.roles.add(role);

    return interaction.reply({
      content: `✅ Key redeemed successfully! You now have access as **${roleName}**.`,
      ephemeral: true
    });
  }
};
