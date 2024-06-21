const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { sad } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");

module.exports = {
  name: 'disconnect',
  async execute(queue) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${sad} Leaving the voice channel! Sayonara.`)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
  }
}