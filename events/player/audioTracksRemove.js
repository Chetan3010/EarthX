const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { success } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");

module.exports = {
  name: 'audioTracksRemove',
  async execute(queue, tracks, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${success} Multiple tracks removed - **${ tracks.length }** tracks.`)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
  }
}