const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed, nowPlayingEmbed } = require('../../configs/utils');
const { useQueue } = require('discord-player');
const { requireSessionConditions } = require('../../configs/music');
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['dm','save'],
	data: new SlashCommandBuilder()
		.setName('save-song')
		.setDescription("Saves the current playing song into your DMs."),
	async execute(interaction, client) {
        if (!requireSessionConditions(interaction, true, false, false)) return;

        try {
          const queue = useQueue(interaction.guild.id);
          if (!queue || !queue.isPlaying()) {
            interaction.reply({ embeds: [ errorEmbed(` No song is currently being player`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
          }
    
          const { currentTrack } = queue;
          if (!currentTrack) {
            interaction.reply({ embeds: [ errorEmbed(` Can't fetch information of currently playing song`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
          }
    
          // Resolve embed and create DM
          const npEmbed = nowPlayingEmbed(queue, false);
          const channel = await interaction.user.createDM().catch(() => null);
          if (!channel) {
            interaction.reply({ embeds: [ errorEmbed(` I don't have permission to DM you`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
          }
    
          // Try to send dm
          try {
            await channel.send({ embeds: [ npEmbed ] });
          }
          catch {
            interaction.reply({ embeds: [ errorEmbed(`I don't have permission to DM you`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
          }
    
          // Feedback
          await interaction.reply({ embeds: [ successEmbed(` [${ escapeMarkdown(currentTrack.title) }](${ currentTrack.url }) song saved into your DMs`)]});  
          setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/save-song\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};