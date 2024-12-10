const { useHistory } = require("discord-player");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['pp', 'back', 'previous'],
    data: {
        name: 'play-previous'
    },
    async execute(client, message) {

        // Check state
        if (!requireSessionConditions(message, true)) return;

        try {
            const history = useHistory(message.guildId);
            if (!history?.previousTrack) {
                await message.reply({ embeds: [errorEmbed(` No tracks in history`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred with prefix play-previous command!')
                        console.log(err);
                    });
            }

            // Ok
            await history.previous();
            await message.reply({ embeds: [successEmbed(` Playing previous song requested by - ${message.author}`)] })
                .then(msg => setTimeout(() => msg.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix replay command!')
                    console.log(err);
                });

        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`play-previous\` command`)
                ],
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix play-previous command!')
                console.log(err);
            });
        }
    },
};