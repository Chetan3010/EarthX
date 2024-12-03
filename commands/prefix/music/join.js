const { useMainPlayer } = require("discord-player");
const { getGuildSettingsForMessage } = require("../../../helper/db");
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { success } = require("../../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['j'],
    data: {
        name: 'join'
    },

    async execute(client, message) {

        try {
            if (!requireSessionConditions(message, false, true, false)) return;

            if (message.guild.members.me?.voice?.channel === message.member.voice?.channel) {
                return message.reply({ embeds: [errorEmbed(`I'm already in <#${message.guild.members.me?.voice?.channel.id}> channel`)] })
            }
            const clientSettings = await getGuildSettingsForMessage(message)
            const player = useMainPlayer();
            const queue = player.queues.create(message.guildId, {
                repeatMode: clientSettings.repeatMode,
                noEmitInsert: true,
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
            });

            await queue.connect(message.member.voice.channel);

            return message.react(success)

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`join\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix join command!')
                console.log(err);
            });
        }
    },
};