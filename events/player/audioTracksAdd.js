const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { musicmany } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
  name: 'audioTracksAdd',
  async execute(queue, tracks, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${musicmany} **${ tracks.length }** tracks from **[${tracks[0].playlist.title}]** added to the queue By ${tracks[0].requestedBy}.`)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => {
      errorLog('An error occured with player event!')
        console.log(error);
    })
  }
}