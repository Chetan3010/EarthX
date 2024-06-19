const { EmbedBuilder } = require("discord.js")
const { errorColor } = require("../../configs/config")

module.exports = {
    name: 'error',
    async execute(queue, error) {
        queue.metadata.channel.send({ embeds: [
            new EmbedBuilder()
                .setColor(errorColor)
                .setTitle('Player Error')
                .setDescription(error.message.slice(0, 4096))
        ]})
    }
}