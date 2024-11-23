const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, requireSessionConditions, repeatModeEmojiStr } = require('../../../helper/utils');
const { useQueue, QueueRepeatMode } = require('discord-player');
const { errorLog } = require('../../../configs/logger');
const { enabled, disabled, leftAngleDown, arrow } = require('../../../configs/emojis');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { botColor } = require('../../../configs/config');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['ap'],
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription("Toggle autoplay, Autoplay plays recommended music when queue is empty applies to current session"),

    async execute(interaction, client) {

        // Check state
        if (!requireSessionConditions(interaction)) return;

        try {
            const queue = useQueue(interaction.guild.id);
            if (!queue) {
                await interaction.reply({ embeds: [errorEmbed(` No music is being played - initialize a session first to set mode`)] })
                setTimeout(() => {
                    interaction.deleteReply()
                }, ERROR_MSGE_DELETE_TIMEOUT);
                return;
            }

            let isAutoplay = null
            if (queue.repeatMode === QueueRepeatMode.AUTOPLAY) {
                queue.setRepeatMode(0);
                isAutoplay = false
            } else {
                queue.setRepeatMode(3)
                isAutoplay = true
            }
            // Resolve repeat mode

            if (queue.metadata?.nowPlaying) {

                const msg = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying)
                const embedObject = msg.embeds[0].toJSON();
                // Find the field you want to update by name and update its value
                const fieldIndex = embedObject.fields.findIndex(field => field.name === `${leftAngleDown} Repeat mode`);
                if (fieldIndex !== -1) {
                    embedObject.fields[fieldIndex].value = `${arrow} ${repeatModeEmojiStr(queue.repeatMode)}`;
                } else {
                    await interaction.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, ERROR_MSGE_DELETE_TIMEOUT);
                    errorLog(error)
                    return;
                }

                const updatedEmbed = new EmbedBuilder(embedObject);

                msg.edit({ embeds: [updatedEmbed] });
            }

            let msge = ''
            if (isAutoplay) {
                msge = `${enabled} Autoplay is now **[enabled](https://discord.com/channels/1248989810459152384/1254197147662815343/${queue.metadata.nowPlaying})** for the current session.\nIf you want it persistent use \`/repeat-mode\` with persistent true`
            } else {
                msge = `${disabled} Autoplay is now **[disabled](https://discord.com/channels/1248989810459152384/1254197147662815343/${queue.metadata.nowPlaying})** for the current session.\nIf you want it persistent use \`/repeat-mode\` with persistent true`
            }
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(msge)
                ]
            });
        }
        catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/autoplay\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};