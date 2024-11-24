const { usePlayer } = require("discord-player");
const { errorLog } = require("../../../configs/logger");
const { requireSessionConditions, successEmbed, errorEmbed } = require("../../../helper/utils");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['next', 's'],
    data: {
        name: 'skip'
    },

    async execute(client, message) {

        if (!requireSessionConditions(message, true)) return;

        try {
            const guildPlayerNode = usePlayer(message.guildId);

            const currentTrack = guildPlayerNode.queue.currentTrack;
            if (!currentTrack) {
                return message.reply({
                    embeds: [
                        errorEmbed(`No music is currently being played`)
                    ]
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occured with prefix skip command!')
                    console.log(err);
                })
            }

            const successSkip = guildPlayerNode.skip();
            return message.reply({
                embeds: [
                    successSkip
                        ? successEmbed(` Skipped **[${currentTrack}](${currentTrack.url})** song - By ${message.author}`)
                        : errorEmbed(` Something went wrong - couldn't skip current playing song`)
                ]
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occured with prefix skip command!')
                console.log(err);
            })
        }
        catch (error) {
            errorLog(error.message)
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`skip\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occured with prefix skip command!')
                console.log(err);
            })
        }
    },
};