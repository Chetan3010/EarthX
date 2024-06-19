const { EmbedBuilder } = require("discord.js")
const { errorColor } = require("../../configs/config")

module.exports = {
    name: 'debug',
    async execute(queue, message) {
        // console.log(message);
        // queue.metadata.channel.send({ embeds: [
        //     new EmbedBuilder()
        //         .setColor(errorColor)
        //         .setTitle('Player Queue Error please checkout logs.')
        // ]})
    }
}