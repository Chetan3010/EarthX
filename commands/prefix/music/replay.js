const { useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { EmbedBuilder } = require("discord.js");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { wait } = require("../../../configs/emojis");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['rp'],
    data: {
        name: 'replay'
    },
    async execute(client, message) {

        // Check state
        if (!requireSessionConditions(message, true)) return;

        try {
            const msge = await message.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(` Replaying, please wait... ${wait}`)
                ]
            });

            // Rewind to 0:00
            const queue = useQueue(message.guildId);
            await queue.node.seek(0);

            // Create success response
            await msge.edit({ embeds: [successEmbed(` Replaying current song - By ${message.author}`)] })
                .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix queue command!')
                    console.log(err);
                });

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`replay\` command`)
                ],
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix replay command!')
                console.log(err);
            });
        }
    },
};