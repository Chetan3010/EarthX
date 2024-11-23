const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed, requireSessionConditions, getProgressBar } = require('../../../helper/utils');
const { MS_IN_ONE_SECOND, ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { useQueue } = require('discord-player');
const { errorLog } = require('../../../configs/logger');
const { cyanDot, bottomArrow, wait } = require('../../../configs/emojis');

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

        // Check if default params
        if (totalMs === 0) {
            await interaction.reply({ embeds: [errorEmbed(` Default command options provided, if you want to replay a track, use \`/replay\``)] });
            setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT);
            return;
        }

        // Check state
        if (!requireSessionConditions(interaction, true)) return;

        const queue = useQueue(interaction.guild.id);
        // Not a point in duration
        if (totalMs > queue.currentTrack?.durationMS) {
            await interaction.reply({ embeds: [errorEmbed(` Not a valid timestamp for song`)] });
            setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT);
            return;
        }

        try {
            // Acknowledge the interaction
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setDescription(`Seeking to ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}, please wait... ${wait}`)
                ]
            });

            // Seek to the specified timestamp
            await queue.node.seek(totalMs);

            // Create success response
            interaction.editReply({ embeds: [successEmbed(` Setting playback timestamp to ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} - By ${interaction.user}`)] });
            setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT);

            // Check if there is a now-playing message to update
            // if (queue.metadata?.nowPlaying) {
            //     const channel = queue.metadata.channel;
            //     const nowPlayingMessageId = queue.metadata.nowPlaying;

            //     try {
            //         const nowPlayingMessage = await channel.messages.fetch(nowPlayingMessageId);
            //         const embed = nowPlayingMessage.embeds[0];

            //         const progressBarFieldIndex = embed.fields.findIndex(field => field.name === `${cyanDot} Progress ${bottomArrow}`);
            //         if (progressBarFieldIndex !== -1) {
            //             embed.fields[progressBarFieldIndex].value = getProgressBar(queue.node);
            //         }

            //         await nowPlayingMessage.edit({ embeds: [embed] });
            //     } catch (error) {
            //         console.log(`Failed to fetch or edit now-playing message: ${error}`);
            //     }
            // }
        } catch (error) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/seek\` command`)
                ],
                ephemeral: true
            });
            errorLog(error);
        }
    },
};
