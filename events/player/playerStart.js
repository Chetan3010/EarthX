const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");

module.exports = {
  name: 'playerStart',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`🎵 Started Playing **[${ escapeMarkdown(track.title) }](${ track.url })**`)
    ]});
  }
}