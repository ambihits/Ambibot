const { SlashCommandBuilder } = require('discord.js');
const { supabase } = require('../utils/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('extend')
    .setDescription('Extend a user license by a number of days or forever.')
    .addStringOption(option =>
      option.setName('discord_id')
        .setDescription('The Discord ID of the user')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days to extend')
        .setRequired(false)),
  async execute(interaction) {
    const discordId = interaction.options.getString('discord_id');
    const days = interaction.options.getInteger('days');

    console.log(`🔧 /extend called for Discord ID: ${discordId} with days: ${days}`);

    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (error || !data) {
      console.error('❌ Could not find redemption for user:', error || 'No data found');
      return interaction.reply({ content: 'User not found in database.', ephemeral: true });
    }

    let newExpiration;
    if (days === null) {
      newExpiration = new Date('2099-12-31T23:59:59Z'); // lifetime
    } else {
      const currentExp = new Date(data.expires_at);
      currentExp.setUTCDate(currentExp.getUTCDate() + days);
      newExpiration = currentExp;
    }

    const { error: updateError } = await supabase
      .from('redemptions')
      .update({ expires_at: newExpiration.toISOString() })
      .eq('discord_id', discordId);

    if (updateError) {
      console.error('❌ Failed to update expiration:', updateError);
      return interaction.reply({ content: 'Failed to update expiration.', ephemeral: true });
    }

    const finalMsg = days === null
      ? `✅ Extended ${discordId} to lifetime.`
      : `✅ Extended ${discordId} by ${days} day(s).`;

    return interaction.reply({ content: finalMsg, ephemeral: false });
  },
};

