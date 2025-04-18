const { SlashCommandBuilder } = require('discord.js');
const { getSupabaseClient } = require('../utils/supabase');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('extend')
    .setDescription('Extend a user\'s license by a number of days')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to extend')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('days')
        .setDescription('Number of days to extend')
        .setRequired(true)),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const days = interaction.options.getInteger('days');
    const discordId = targetUser.id;

    console.log(`🔧 /extend called for Discord ID: ${discordId} with days: ${days}`);

    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('redemptions')
      .select('*')
      .eq('discord_id', discordId)
      .single();

    if (error || !data) {
      console.error('❌ Failed to fetch user record:', error || 'User not found');
      return await interaction.reply({ content: 'User not found in license system.', ephemeral: true });
    }

    const newExpiration = new Date(data.expires_at);
    newExpiration.setDate(newExpiration.getDate() + days);

    const { error: updateError } = await supabase
      .from('redemptions')
      .update({ expires_at: newExpiration.toISOString() })
      .eq('discord_id', discordId);

    if (updateError) {
      console.error('❌ Failed to update expiration:', updateError);
      return await interaction.reply({ content: 'Failed to extend license.', ephemeral: true });
    }

    await interaction.reply({ content: `✅ Extended license for <@${discordId}> by ${days} days.`, ephemeral: true });
  }
};



