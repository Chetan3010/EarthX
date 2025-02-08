const { usePlayer } = require("discord-player");
const { errorLog } = require("../../../configs/logger");
const { requireSessionConditions, errorEmbed } = require("../../../helper/utils");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { success } = require("../../../configs/emojis");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['next', 's'],
    data: {
        name: 'skip',
        description: "Skip the currently playing song and play the next song in queue"
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
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            const successSkip = guildPlayerNode.skip();
            if (successSkip) {
                await message.react(success); // React with success emoji
            } else {
                await message.reply({
                    embeds: [
                        errorEmbed(`Something went wrong - couldn't skip current playing song`)
                    ]
                }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }
        }
        catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`skip\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};