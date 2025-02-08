const { useHistory } = require("discord-player");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['back', 'prev'],
    data: {
        name: 'play-previous',
        description: "Play the previous song that was in the queue"
    },
    async execute(client, message) {
        if (!requireSessionConditions(message, true)) return;

        try {
            const history = useHistory(message.guildId);
            if (!history?.previousTrack) {
                return message.reply({ embeds: [errorEmbed(` No tracks in history`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
                    .catch(err => errorLog(err));
            }

            await history.previous();
            return message.reply({ embeds: [successEmbed(` Playing previous song requested by - ${message.author}`)] })
                .then(msg => setTimeout(() => msg.delete(), BOT_MSGE_DELETE_TIMEOUT))
                .catch(err => errorLog(err));

        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [errorEmbed(`Something went wrong while executing \`play-previous\` command`)]
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
              .catch(err => errorLog(err));
        }
    },
};