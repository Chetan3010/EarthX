const { useMainPlayer, useQueue } = require("discord-player");
const { getGuildSettingsForMessage } = require("../../../helper/db");
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { success } = require("../../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['l'],
    data: {
        name: 'leave'
    },

    async execute(client, message) {

        try {
            if (!requireSessionConditions(message, false, false, false)) return;

            const queue = useQueue(message.guildId);

            if (!(queue && queue?.channel?.id)) {
                return message.reply({
                    embeds: [
                        errorEmbed(` I'm not connected to any voice channel`)
                    ],
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred while deleting message in leave prefix command')
                    console.log(err);
                });
                
            }

            if (queue?.metadata?.nowPlaying) {
                try {
                    await queue?.metadata?.channel?.messages.delete(queue.metadata.nowPlaying);
                } catch (error) {
                    if (error.code !== 10008) {
                        errorLog('Failed to delete now playing message:', error);
                    }
                }
            }

            // if (queue.metadata?.updateInterval) {
            //     clearInterval(queue.metadata.updateInterval);
            // }

            if (!queue?.deleted) queue?.delete();

            return message.react(success)

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`leave\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix leave command!')
                console.log(err);
            });
        }
    },
};