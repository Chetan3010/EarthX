const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { sad } = require("../../configs/emojis");

module.exports = {
  name: 'emptyQueue',
  async execute(queue, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${sad} Queue is now empty, use **\`/play\`** to add something.`)
    ]});
  }
}