const { useMainPlayer, useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, nowPlayingEmbed } = require("../../../helper/utils");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { getGuildSettingsForMessage } = require("../../../helper/db");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['np'],
    data: {
        name: 'now-playing'
    },
    async execute(client, message) {

        if (!requireSessionConditions(message, true, false, false)) return;

        try {

            const queue = useQueue(message.guildId);
            if (!queue) {
                return message.reply({ embeds: [errorEmbed(` Queue is currently empty`)] })
                    .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occured with prefix now-playing command!')
                        console.log(err);
                    })
            }

            const { currentTrack } = queue;
            if (!currentTrack) {
                return message.reply({ embeds: [errorEmbed(`Can't fetch information of current playing song`)] })
                    .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occured with prefix now-playing command!')
                        console.log(err);
                    })
            }

            const npEmbed = nowPlayingEmbed(message, client, queue);
            return message.reply({ embeds: [npEmbed] });

        } catch (error) {
            errorLog(error.message)
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`now-playing\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occured with prefix now-playing command!')
                console.log(err);
            })
        }
    }
};