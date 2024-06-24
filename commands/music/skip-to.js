const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../configs/utils');
const { requireSessionConditions } = require('../../configs/music');
const { useQueue, useMainPlayer, TrackSkipReason } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [''],
	data: new SlashCommandBuilder()
		.setName('skip-to')
		.setDescription("Skip to provided /queue song position, removing everything up to the song")
        .addIntegerOption(option =>
            option.setName('position')
                .setDescription('The song/track position to skip to.')
                .setRequired(true)
                .setMinValue(2)
                .setMaxValue(999_999)
            ),

	async execute(interaction, client) {

        const skipToIndex = Number(interaction.options.getInteger('position')) - 1;

        // Check state
        if (!requireSessionConditions(interaction, true)) return;
    
        // Check has queue
        const queue = useQueue(interaction.guild.id);
        if (queue.isEmpty()) {
          interaction.reply({ embeds: [ errorEmbed(` Queue is currently empty`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
          return;
        }
    
        // Check bounds
        const queueSizeZeroOffset = queue.size - 1;
        if (skipToIndex > queueSizeZeroOffset) {
          interaction.reply({ embeds: [ errorEmbed(` There is nothing at queue position ${ skipToIndex + 1 }, The highest position is ${ queue.size }`)]});
          setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
          return;
        }
    
        try {
          // Jump to position
          const track = queue.tracks.at(skipToIndex);
          queue.node.skipTo(skipToIndex);
          await interaction.reply({ embeds: [ successEmbed(` Skipping to [${ escapeMarkdown(track.title) }](${ track.url }) song directly and removed everything up to the song - By ${interaction.user}`)]});
          setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)
            
        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/skip-to\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};