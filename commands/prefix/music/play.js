const { useMainPlayer } = require('discord-player');
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { getGuildSettingsForMessage } = require("../../../helper/db");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['p'],
    data: {
        name: 'play',
        description: "Play a song from YouTube with high quality audio"
    },
    async execute(client, message, args) {
        const player = useMainPlayer();
        const channel = message.member.voice.channel;

        if (!requireSessionConditions(message, false, true, false)) return;

        if (!args[0]) {
            return message.reply({ embeds: [errorEmbed(` Please provide a search term or URL`)] })
                .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
                .catch(err => errorLog(err));
        }

        try {
            const query = args.join(' ');
            const searchResult = await player.search(query, { requestedBy: message.author });

            if (!searchResult.hasTracks()) {
                return message.reply({ embeds: [errorEmbed(`No track found for ${query}`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
                    .catch(err => errorLog(err));
            }

            const clientSettings = await getGuildSettingsForMessage(message);
            await player.play(channel, searchResult, {
                requestedBy: message.author,
                nodeOptions: {
                    // Guild settings
                    repeatMode: clientSettings.repeatMode,
                    volume: clientSettings.volume,
                    leaveOnEmpty: clientSettings.leaveOnEmpty,
                    leaveOnEmptyCooldown: clientSettings.leaveOnEmptyCooldown,
                    leaveOnStop: clientSettings.leaveOnStop,
                    leaveOnStopCooldown: clientSettings.leaveOnStopCooldown,
                    leaveOnEnd: clientSettings.leaveOnEnd,
                    leaveOnEndCooldown: clientSettings.leaveOnEmptyCooldown,
                    pauseOnEmpty: clientSettings.pauseOnEmpty,
                    selfDeaf: clientSettings.selfDeaf,
                    
                    // Player settings
                    noEmitInsert: true,
                    skipOnNoStream: false,
                    bufferingTimeout: 15000,
                    smoothVolume: true,
                    volumeSmoothness: 0.08,
                    noFilterAboutVolume: true,

                    // Audio quality settings
                    ffmpegFilters: [
                        'bass=g=4,dynaudnorm=f=200',
                        'acompressor=threshold=-12dB:ratio=16:attack=25:release=100',
                        'highpass=f=100,lowpass=f=16000',
                        'equalizer=f=100:t=h:w=200:g=4'
                    ],
                    opusEncodeOptions: {
                        frameSize: 60,
                        fec: true,
                        packetLoss: 1
                    },

                    metadata: {
                        channel: message.channel,
                        member: message.member,
                        timestamp: message.createdTimestamp,
                        message
                    }
                }
            });

        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [errorEmbed(`Something went wrong while executing \`play\` command`)]
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
              .catch(err => errorLog(err));
        }
    },
};