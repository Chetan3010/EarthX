const { EmbedBuilder } = require("discord.js")
const { errorColor } = require("../../configs/config")

module.exports = {
    name: 'error',
    async execute(queue, error) {
        console.log(error);
        queue.metadata.channel.send({ embeds: [
            new EmbedBuilder()
                .setColor(errorColor)
                .setDescription('Something went wrong with player queue. Sorry.')
        ]})
    }
}