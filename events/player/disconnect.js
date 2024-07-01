const { EmbedBuilder } = require("discord.js");
const { botColor } = require("../../configs/config");
const { sad } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
    name: 'disconnect',
    async execute(queue) {
        try {
            if (queue.metadata?.nowPlaying) {
                await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
            }

            if (queue.metadata?.updateInterval) {
                clearInterval(queue.metadata.updateInterval);
            }

            queue.metadata.nowPlaying = null;
            queue.metadata.updateInterval = null;
            queue.metadata.currentTrackId = null;

            await queue.metadata.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(`${sad} Leaving the voice channel, Sayonara.`)
                ]
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT));

        } catch (error) {
            errorLog('An error occurred with player event!');
            console.log(error);
        }
    }
};
