const { usePlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');
const { BOT_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { errorEmbed, successEmbed, requireSessionConditions } = require('../../helper/utils');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['next'],
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skip the currently playing song'),

    async execute(interaction, client) {

        if (!requireSessionConditions(interaction, true)) return;

        try {
            const guildPlayerNode = usePlayer(interaction.guild.id);

            const currentTrack = guildPlayerNode.queue.currentTrack;
            if (!currentTrack) {
                await interaction.reply({
                    embeds: [
                        errorEmbed(`No music is currently being played`)
                    ]
                })
                setTimeout(() => {
                    interaction.deleteReply()
                }, BOT_MSGE_DELETE_TIMEOUT);
                return;
            }

            const successSkip = guildPlayerNode.skip();
            await interaction.reply({
                embeds: [
                    successSkip
                        ? successEmbed(` Skipped **[${currentTrack}](${currentTrack.url})** song - By ${interaction.user}.`)
                        : errorEmbed(` Something went wrong - couldn't skip current playing song.`)
                ]
            })
            setTimeout(() => {
                interaction.deleteReply()
            }, BOT_MSGE_DELETE_TIMEOUT);
            return
        }
        catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/skip\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    },
};