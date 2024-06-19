const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { success } = require("../../configs/emojis");

module.exports = {
  name: 'audioTracksRemove',
  async execute(queue, tracks, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${success} Multiple tracks removed - **${ tracks.length }** tracks.`)
    ]});
  }
}