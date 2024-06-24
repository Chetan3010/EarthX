const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../configs/utils');
const { requireSessionConditions } = require('../../configs/music');
const { useQueue } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { errorLog } = require('../../configs/logger');

const SONG_POSITION_OPTION_ID = 'song-position';

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription("Remove a song that is current in /queue by position.")
        .addIntegerOption(option =>
            option.setName(SONG_POSITION_OPTION_ID)
                .setDescription('The position of the source song.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(999_999)
            ),

	async execute(interaction, client) {
        const songPosition = Number(interaction.options.getInteger(SONG_POSITION_OPTION_ID)) - 1;

        // Check state
        if (!requireSessionConditions(interaction, true)) return;
    
        try {
          const queue = useQueue(interaction.guild.id);
    
          // Not enough songs in queue
          if ((queue?.size ?? 0) < 2) {
            interaction.reply({ embeds: [ errorEmbed(` Not enough songs in the queue to remove`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

            return;
          }
    
          // Check bounds/constraints
          const queueSizeZeroOffset = queue.size - 1;
          if (songPosition > queueSizeZeroOffset) {
            interaction.reply({ embeds: [ errorEmbed(` The \`${
              SONG_POSITION_OPTION_ID + '` Given position is'
            } not within valid range of 1-${ queue.size }`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
          }
    
          // Remove song - assign track before #removeTrack
          const track = queue.tracks.data.at(songPosition);
          queue.removeTrack(songPosition);
          interaction.reply({ embeds: [ successEmbed(` [${ escapeMarkdown(track.title) }](${ track.url }) has been removed from the queue - By ${interaction.user}`) ]});
          setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/remove\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};