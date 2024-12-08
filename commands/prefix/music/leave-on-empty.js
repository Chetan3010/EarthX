const { useQueue, useMainPlayer } = require("discord-player");
const { errorLog } = require("../../../configs/logger");
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const GuildModel = require("../../../schema/guild");
const { botColor } = require("../../../configs/config");
const { EmbedBuilder } = require("discord.js");
const { disabled, enabled } = require("../../../configs/emojis");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['loe', '247', '24/7'],
    data: {
        name: 'leave-on-empty'
    },

    async execute(client, message) {

        try {

            // Check state
            if (!requireSessionConditions(message, false, true, false)) return;

            const clientSettings = await GuildModel.findOne({ guildId: message.guildId })
            clientSettings.leaveOnEmpty = !clientSettings.leaveOnEmpty
            await clientSettings.save()

            const queue = useQueue(message.guildId)
            if (queue) {
                queue.options.leaveOnEmpty = clientSettings.leaveOnEmpty
            } else {
                if (!clientSettings.leaveOnEmpty) {
                    const player = useMainPlayer();
                    const queue = player.queues.create(message.guildId, {
                        // requestedBy: interaction.user,
                        // nodeOptions: {
                        repeatMode: clientSettings.repeatMode,
                        // noEmitInsert: true,
                        skipOnNoStream: true,
                        // preferBridgedMetadata: true,
                        // disableBiquad: true,
                        volume: clientSettings.volume,
                        leaveOnEmpty: clientSettings.leaveOnEmpty, //If the player should leave when the voice channel is empty
                        leaveOnEmptyCooldown: clientSettings.leaveOnEmptyCooldown, //Cooldown in ms
                        leaveOnStop: clientSettings.leaveOnStop, //If player should leave the voice channel after user stops the player
                        leaveOnStopCooldown: clientSettings.leaveOnStopCooldown, //Cooldown in ms
                        leaveOnEnd: clientSettings.leaveOnEnd, //If player should leave after the whole queue is over
                        leaveOnEndCooldown: clientSettings.leaveOnEmptyCooldown, //Cooldown in ms
                        pauseOnEmpty: clientSettings.pauseOnEmpty,
                        selfDeaf: clientSettings.selfDeaf,
                        metadata: {
                            channel: message.channel,
                            member: message.member,
                            timestamp: message.createdTimestamp,
                            interaction: message
                        }
                        // },
                    });

                    await queue.connect(message.member.voice.channel);
                }
            }

            await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(`${clientSettings.leaveOnEmpty ? disabled : enabled} 24/7 mode is now **${clientSettings.leaveOnEmpty ? 'disabled' : 'enabled'}**.`)
                ]
            })

        }
        catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`leave-on-empty\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix leave-on-empty command!')
                console.log(err);
            });
        }
    },
};