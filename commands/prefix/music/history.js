const { useHistory } = require("discord-player");
const { requireSessionConditions, errorEmbed, queueEmbedResponse } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['h'],
    data: {
        name: 'history',
        description: "Display the history of previously played songs in this session"
    },

    async execute(client, message) {

        if (!requireSessionConditions(message, true, false, false)) return;

        try {
            const history = useHistory(message.guildId);
            if (!history) {
                return message.reply({ embeds: [errorEmbed(`History is currently empty`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred with prefix history command!')
                        console.log(err);
                    });
            }

            // Show history, interactive
            queueEmbedResponse(message, history, 'History');

        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`history\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};