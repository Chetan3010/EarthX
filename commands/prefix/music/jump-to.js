const { useQueue } = require("discord-player");
const { errorLog } = require("../../../configs/logger");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['jt'],
    data: {
        name: 'jump-to',
        description: "Jump to a specific position in the queue without removing other songs. Usage: jump-to <position number>"
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
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred while executing jump-to command!')
                        console.log(err);
                    });
            }

            // Check bounds
            const queueSizeZeroOffset = queue.size - 1;
            if (jumpToIndex > queueSizeZeroOffset) {
                return message.reply({ embeds: [errorEmbed(`There is nothing at song position ${jumpToIndex + 1}, The highest position is ${queue.size}`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred while executing jump-to command!')
                        console.log(err);
                    });
            }

            // Try to jump to new position/queue
            queue.node.jump(jumpToIndex);

            return message.reply({ embeds: [successEmbed(`Jumping to **${jumpToIndex + 1}** song`)] })
                .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred while executing jump-to command!')
                    console.log(err);
                });
        }
        catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`jump-to\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};