const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../configs/utils');
const { requireSessionConditions } = require('../../configs/music');
const { useQueue } = require('discord-player');
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');

const FROM_OPTION_ID = 'from-position';
const TO_OPTION_ID = 'to-position';

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['move'],
	data: new SlashCommandBuilder()
		.setName('move-song')
		.setDescription("Move a song that is current in /queue")
        .addIntegerOption(option =>
            option.setName(FROM_OPTION_ID)
                .setDescription('The position of the source song.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(999_999)
            )
        .addIntegerOption(option =>
            option.setName(TO_OPTION_ID)
                .setDescription('The destination position')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(999_999)
            ),

	async execute(interaction, client) {

        const fromPosition = Number(interaction.options.getInteger(FROM_OPTION_ID)) - 1;
        const toPosition = Number(interaction.options.getInteger(TO_OPTION_ID)) - 1;
    
        // Check state
        if (!requireSessionConditions(interaction, true)) return;
    
        try {
          const queue = useQueue(interaction.guild.id);
    
          // Not enough songs in queue
          if ((queue?.size ?? 0) < 2) {
            interaction.reply({ embeds: [ errorEmbed(` Not enough songs in queue to perform any move action`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

            return;
          }
    
          // Check bounds/constraints
          const queueSizeZeroOffset = queue.size - 1;
          if (
            fromPosition > queueSizeZeroOffset
            || toPosition > queueSizeZeroOffset
          ) {

            interaction.reply({ emebeds: [ errorEmbed(` The \`${
              fromPosition > queueSizeZeroOffset
                ? toPosition > queueSizeZeroOffset
                  ? `${ FROM_OPTION_ID } and ${ TO_OPTION_ID }\` parameters are both`
                  : FROM_OPTION_ID + '` parameter is'
                : TO_OPTION_ID + '` parameter is'
            } not within valid range of 1-${ queue.size }`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

            return;
          }
    
          // Is same
          if (fromPosition === toPosition) {
            interaction.reply({ emebeds: [ errorEmbed(` \`${ FROM_OPTION_ID }\` and \`${ TO_OPTION_ID }\` are both identical`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

            return;
          }
    
          // Swap src and dest
          queue.moveTrack(fromPosition, toPosition);
          // use toPosition, because it's after #swap
          const firstTrack = queue.tracks.data.at(toPosition);
          interaction.reply({ embeds: [ successEmbed(` [${ escapeMarkdown(firstTrack.title) }](${ firstTrack.url }) song has been moved to position **\`${ toPosition + 1 }\`**`)]});
          setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)


        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/move-song\` command`)
                ],
                ephemeral: true
            });
            console.error(error)
        }
		
	},
};