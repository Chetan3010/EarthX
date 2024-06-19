const { EmbedBuilder } = require("discord.js")
const { errorColor } = require("../../configs/config")

module.exports = {
    on: true,
    name: 'debug',
    async execute(message) {
        // console.log(message);
        // queue.metadata.channel.send({ embeds: [
        //     new EmbedBuilder()
        //         .setColor(errorColor)
        //         .setTitle('Player Error please checkout logs.')
        // ]})
    }
}