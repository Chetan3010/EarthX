const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { greenDot, redDot } = require("../../configs/emojis");

module.exports = {
  name: 'emptyChannel',
  async execute(queue, client) {
    let msge = ''

    if(!queue.leaveOnEmpty) msge = `${greenDot} Staying in channel as 24/7 is enabled.`
    else{
      msge = `${redDot} Leaving empty channel in ${ queue.leaveOnEmptyCooldown / 60000}mins.`
    }
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
    .setColor(botColor)
    .setDescription(msge)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
  }
}

