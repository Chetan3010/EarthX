const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");

module.exports = {
  name: 'playerSkip',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${error} Track skipped because the audio stream couldn't be extracted: **[${ escapeMarkdown(track.cleanTitle || track.title) }](${ track.url })**.`)
    ]});
  }
}