const { useQueue } = require("discord-player");
const { requireSessionConditions, queueEmbedResponse, errorEmbed } = require("../../../helper/utils");
const { EmbedBuilder } = require("discord.js");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['q'],
    data: {
        name: 'queue'
    },

    async execute(client, message) {

        // Check state
        if (!requireSessionConditions(message, true, false, false)) return;

        try {
            const queue = useQueue(message.guildId);
            if (!queue) {
                await message.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(botColor)
                            .setDescription(`${sad} Queue is currently empty.`)
                    ]
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occured with prefix queue command!')
                    console.log(err);
                })
            }

            queueEmbedResponse(message, queue);

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`queue\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix queue command!')
                console.log(err);
            });
        }
    },
};