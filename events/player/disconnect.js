const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { sad } = require("../../configs/emojis");

module.exports = {
  name: 'disconnect',
  async execute(queue) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${sad} Leaving the voice channel! Sayonara.`)
    ]});
  }
}