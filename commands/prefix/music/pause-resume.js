const { usePlayer } = require("discord-player");
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { success } = require("../../../configs/emojis");
const { errorLog } = require("../../../configs/logger");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['pause', 'resume', 'pr'],
    data: {
        name: 'pause-resume'
    },

    async execute(client, message) {

        // Check state
        if (!requireSessionConditions(message, true)) return;

        try {
            const guildPlayerNode = usePlayer(message.guildId);
            const newPauseState = !guildPlayerNode.isPaused();
            guildPlayerNode.setPaused(newPauseState);
            return message.react(success)
        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`pause-resume\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix pause-resume command!')
                console.log(err);
            });
        }
    },
};