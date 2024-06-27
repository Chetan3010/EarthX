const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
const { errorEmbed, nowPlayingEmbed } = require("../../helper/utils");
const { requireSessionConditions } = require("../../helper/music");
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
                interaction.reply({ embeds: [errorEmbed(` Queue is currently empty`)] })
                setTimeout(() => {
                    interaction.deleteReply()
                }, ERROR_MSGE_DELETE_TIMEOUT);
                return;
            }

            const { currentTrack } = queue;
            if (!currentTrack) {
                interaction.reply({ embeds: [errorEmbed(`Can't fetch information of current playing song`)] })
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            const npEmbed = nowPlayingEmbed(interaction, client);
            await interaction.reply({ embeds: [npEmbed] });

            // const interval = setInterval(async () => {
            //     if (!queue.currentTrack) {
            //         clearInterval(interval);
            //         return;
            //     }
            //     const embed = nowPlayingEmbed(queue, client);
            //     const messageToEdit = await message;
            //     await messageToEdit.edit({ embeds: [embed] });
            // }, 10000);

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/now-playing\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
            console.log(error);
        }

    },
};