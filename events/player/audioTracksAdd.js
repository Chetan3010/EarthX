const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { success } = require("../../configs/emojis");

module.exports = {
  name: 'audioTracksAdd',
  async execute(queue, tracks, client) {
    console.log(tracks);
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${success} Multiple tracks added to the queue - **${ tracks.length }** tracks - From ${tracks[0].playlist.title} - By ${tracks[0].requestedBy}.`)
    ]});
  }
}