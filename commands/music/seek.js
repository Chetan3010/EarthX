const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../helper/utils');
const { MS_IN_ONE_SECOND, ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { requireSessionConditions } = require('../../helper/music');
const { useQueue } = require('discord-player');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
	data: new SlashCommandBuilder()
		.setName('seek')
		.setDescription("Jump to a specific time in the current song")
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('The minute to jump to.')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(999_999)
            )
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('The seconds to jump to.')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(59)
            ),
	async execute(interaction, client) {

        const minutes = Number(interaction.options.getInteger('minutes') ?? 0);
        const seconds = Number(interaction.options.getInteger('seconds') ?? 0);
        const totalMs = (minutes * 60 + seconds) * MS_IN_ONE_SECOND;
    
        // Check is default params
        if (totalMs === 0) {
            interaction.reply({ embeds: [ errorEmbed(` Default command options provided, if you want to replay a track, use \`/replay\``)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
          return;
        }
    
    
        // Check state
        if (!requireSessionConditions(interaction, true)) return;
    
        // Not a point in duration
        if (totalMs > useQueue(interaction.guild.id).currentTrack?.durationMS) {
          interaction.reply({ embeds: [ errorEmbed(` Not a valid timestamp for song`)]});
          setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
          return;
        }
    
        try {
          const queue = useQueue(interaction.guild.id);
          queue.node.seek(totalMs);
          await interaction.reply({ embeds: [ successEmbed(` Setting playback timestamp to ${ String(minutes).padStart(2, '0') }:${ String(seconds).padStart(2, '0') } - By ${interaction.user}`)]});
          setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)
        
        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/seek\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};