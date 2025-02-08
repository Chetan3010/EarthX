const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed, saveSongEmbed, requireSessionConditions } = require('../../../helper/utils');
const { useQueue, Context } = require('discord-player');
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { errorLog } = require('../../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['dm', 'save-song'],
    data: new SlashCommandBuilder()
        .setName('save')
        .setDescription("Like the current playing song? save it."),

    async execute(interaction, client) {
        if (!requireSessionConditions(interaction, true, false, false)) return;
        await interaction.deferReply()

        try {
            const queue = useQueue(interaction.guild.id);
            if (!queue || !queue.isPlaying()) {
                await interaction.editReply({ embeds: [errorEmbed(` No song is currently being player`)] });
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            const { currentTrack } = queue;
            if (!currentTrack) {
                await interaction.editReply({ embeds: [errorEmbed(` Can't fetch information of currently playing song`)] });
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            // Resolve embed and create DM
            const save = saveSongEmbed(interaction, client, queue)
            const channel = await interaction.user.createDM().catch(() => null);
            if (!channel) {
                await interaction.editReply({ embeds: [errorEmbed(` I don't have permission to DM you`)] });
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            // Try to send dm
            try {
                channel.send({ embeds: [save] });
            }
            catch {
                await interaction.editReply({ embeds: [errorEmbed(`I don't have permission to DM you`)] });
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            // Feedback
            await interaction.editReply({ embeds: [successEmbed(` [${escapeMarkdown(currentTrack.cleanTitle || currentTrack.title)}](${currentTrack.url}) song saved into your DMs`)] });
            setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

        } catch (error) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/save-song\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};