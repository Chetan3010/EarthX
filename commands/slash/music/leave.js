const { SlashCommandBuilder } = require("discord.js");
const { successEmbed, errorEmbed, requireSessionConditions } = require("../../../helper/utils");
const { useQueue } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['disconnect'],
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Clear the queue and leaves the voice channel'),

    async execute(interaction, client) {
        try {
            if (!requireSessionConditions(interaction, false, false, false)) return;

            const queue = useQueue(interaction.guild.id);

            if (!(queue && queue?.channel?.id)) {
                await interaction.reply({
                    embeds: [
                        errorEmbed(` I'm not connected to any voice channel`)
                    ],
                });
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT);
                return false;
            }

            if (queue.metadata?.nowPlaying) {
                try {
                    await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
                } catch (error) {
                    if (error.code !== 10008) {
                        errorLog('Failed to delete now playing message:', error);
                    }
                }
            }

            // if (queue.metadata?.updateInterval) {
            //     clearInterval(queue.metadata.updateInterval);
            // }

            if (!queue?.deleted) queue?.delete();

            await interaction.reply({
                embeds: [successEmbed(" Left the voice channel")],
            });
            setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT);
        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/leave\` command`)
                ],
                ephemeral: true
            });
            errorLog(error);
        }
    },
};
