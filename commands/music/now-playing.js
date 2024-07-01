const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
const { errorEmbed, nowPlayingEmbed, requireSessionConditions } = require("../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['np'],
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription("Displays the current playing song's detailed information."),
    async execute(interaction, client) {

        if (!requireSessionConditions(interaction, true, false, false)) return;

        try {
            const queue = useQueue(interaction.guild.id);
            if (!queue) {
                await interaction.reply({ embeds: [errorEmbed(` Queue is currently empty`)] })
                setTimeout(() => {
                    interaction.deleteReply()
                }, ERROR_MSGE_DELETE_TIMEOUT);
                return;
            }

            const { currentTrack } = queue;
            if (!currentTrack) {
                await interaction.reply({ embeds: [errorEmbed(`Can't fetch information of current playing song`)] })
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            const npEmbed = nowPlayingEmbed(interaction, client, queue);
            await interaction.reply({ embeds: [npEmbed] });

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/nowplaying\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    },
};