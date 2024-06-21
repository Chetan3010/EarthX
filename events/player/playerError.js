const { EmbedBuilder } = require("discord.js")
const { errorColor } = require("../../configs/config");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorEmbed } = require("../../configs/utils");

module.exports = {
    name: 'playerError',
    async execute(queue, error) {
        console.log(error);
        queue.metadata.channel.send({ embeds: [
            errorEmbed('Something went wrong with player. Sorry.')
        ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
    }
}