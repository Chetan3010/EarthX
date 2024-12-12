const { useMainPlayer, useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { escapeMarkdown } = require("discord.js");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['pn'],
    data: {
        name: 'play-next'
    },
    async execute(client, message, params) {

        try {

            const player = useMainPlayer();

            const channel = message.member.voice.channelId;

            if (!requireSessionConditions(message, false, true, false)) return;

            const query = params?.join(' ')

            if (!query) {
                return message.reply({
                    embeds: [
                        errorEmbed(`Please provide query to play the song`)
                    ],
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occured with prefix play-next command!')
                    console.log(err);
                })
            }

            // Check is valid
            const searchResult = await player
                .search(query, { requestedBy: message.author })
                .catch(() => null);

            if (!searchResult.hasTracks()) {
                return message.reply({ embeds: [errorEmbed(` No tracks found for search \`${query}\``)] })
                    .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occured with prefix play-next command!')
                        console.log(err);
                    })
            }

            // Ok
            const firstMatchTrack = searchResult.tracks.at(0);
            const queue = useQueue(message.guildId);
            queue.addTrack(firstMatchTrack);

            // Swap first and last conditionally
            queue.swapTracks(0, queue.tracks.data.length - 1);
            return message.reply({ embeds: [successEmbed(` [${escapeMarkdown(firstMatchTrack.title)}](${firstMatchTrack.url}) song has been added to the front of the queue - By ${message.author}`)] })
                .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occured with prefix play-next command!')
                    console.log(err);
                })

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`play-next\` command`)
                ],
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix play-next command!')
                console.log(err);
            });
        }
    },
};