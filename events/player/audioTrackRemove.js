const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { success } = require("../../configs/emojis");

module.exports = {
  name: 'audioTrackRemove',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${success} Track removed - [${ escapeMarkdown(track.title) }](${ track.url }).`)
    ]});
  }
}