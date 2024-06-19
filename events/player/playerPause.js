const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { pause } = require("../../configs/emojis");

module.exports = {
  name: 'playerPause',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${pause} Player is paused for now.`)
    ]});
  }
}