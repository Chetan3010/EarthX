const { useQueue } = require("discord-player");
const { errorLog } = require("../../../configs/logger");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { escapeMarkdown } = require("discord.js");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['st'],
    data: {
        name: 'skip-to',
        description: "Skip to a specific position in the queue. Usage: skip-to <position number>"
    },

    async execute(client, message, params) {

        const jumpToIndex = Number(params[0]) - 1;

        // Check state
        if (!requireSessionConditions(message, true)) return;

        try {

            // Check has queue
            const queue = useQueue(message.guildId);
            if (queue.isEmpty()) {
                return message.reply({ embeds: [errorEmbed(`Queue is currently empty`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            if (jumpToIndex <= 0) {
                return message.reply({ embeds: [errorEmbed(`Please provide the valid value more than 0`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }
            // Check bounds
            const queueSizeZeroOffset = queue.size - 1;
            if (jumpToIndex > queueSizeZeroOffset) {
                return message.reply({ embeds: [errorEmbed(`There is nothing at queue position ${jumpToIndex + 1}, The highest position is ${queue.size}`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            // Jump to position
            const track = queue.tracks.at(jumpToIndex);
            queue.node.skipTo(jumpToIndex);
            return message.reply({ embeds: [successEmbed(` Skipping to [${escapeMarkdown(track.title)}](${track.url}) song directly and removed everything up to the song - By ${message.author}`)] })
                .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));

        }
        catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`skip-to\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};