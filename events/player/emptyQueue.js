const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { sad } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
  name: 'emptyQueue',
  async execute(queue, client) {
    console.log(queue);
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${sad} Queue is now empty, use **\`/play\`** to add something.`)
    ]}).then(msge => setTimeout(() => msge.delete(), 300000 )).catch(error => {
      errorLog('An error occured with player event!')
        console.log(error);
    })
  }
}