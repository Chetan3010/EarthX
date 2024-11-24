const { useMainPlayer } = require("discord-player");
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { getGuildSettingsForMessage } = require("../../../helper/db");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['p'],
    data: {
        name: 'play'
    },
    async execute(client, message, params) {
        
        const player = useMainPlayer();
        
        const channel = message.member.voice.channelId;

        if (!requireSessionConditions(message, false, true, false)) return;
        
        const query = params?.join(' ')

        if(!query){
            return message.reply({
                embeds: [
                    errorEmbed(`Please provide query to play the song`)
                ],
            });
        }

        const searchResult = await player.search(query, { requestedBy: message.author });

        if (!searchResult.hasTracks()) {
            return message.reply({
                embeds: [
                    errorEmbed(`No track found for ${query}`)
                ],
            });
        } else {
            try {
                const clientSettings = await getGuildSettingsForMessage(message)
                // console.log(clientSettings);
                await player.play(channel, searchResult, {
                    requestedBy: message.author,
                    nodeOptions: {
                        repeatMode: clientSettings.repeatMode,
                        noEmitInsert: true,
                        skipOnNoStream: false,
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
                            message,
                        }
                    }
                });

            } catch (error) {
                errorLog(error.message)
                return message.reply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`play\` command`)
                    ],
                })
            }
        }
    },
};