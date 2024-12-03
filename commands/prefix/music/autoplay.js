const { useQueue, QueueRepeatMode } = require("discord-player");
const { requireSessionConditions, errorEmbed, startedPlayingMenu, successEmbed, repeatModeEmojiStr } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { arrow, leftAngleDown, enabled, disabled } = require("../../../configs/emojis");
const { EmbedBuilder } = require("discord.js");
const { errorLog } = require("../../../configs/logger");
const { botColor } = require("../../../configs/config");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['ap'],
    data: {
        name: 'autoplay'
    },

    async execute(client, message) {

        // Check state
        if (!requireSessionConditions(message)) return;

        try {
            
            const queue = useQueue(message.guildId);
            if (!queue) {
                return message.reply({ embeds: [errorEmbed(` No music is being played - initialize a session first to set mode`)] })
                .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix autoplay command!')
                    console.log(err);
                });
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
                    return message.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred with prefix autoplay command!')
                        console.log(err);
                    });
                }

                const updatedEmbed = new EmbedBuilder(embedObject);

                msg.edit({ embeds: [updatedEmbed] });
            }

            let msge = ''
            if (isAutoplay) {
                msge = `${enabled} Autoplay is now **[enabled](https://discord.com/channels/1248989810459152384/1254197147662815343/${queue.metadata.nowPlaying})** for the current session.\nIf you want it persistent use \`repeat-mode\` with persistent true`
            } else {
                msge = `${disabled} Autoplay is now **[disabled](https://discord.com/channels/1248989810459152384/1254197147662815343/${queue.metadata.nowPlaying})** for the current session.\nIf you want it persistent use \`repeat-mode\` with persistent true`
            }
            return message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(msge)
                ]
            });

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`autoplay\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix autoplay command!')
                console.log(err);
            });
        }
    },
};