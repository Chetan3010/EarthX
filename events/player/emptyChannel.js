const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");

module.exports = {
  name: 'emptyChannel',
  async execute(queue, client) {
    let msge = ''

    if(!queue.leaveOnEmpty) msge = `Staying in channel as 24/7 is enabled.`
    else{
      msge = `Leaving empty channel in ${ queue.leaveOnEmptyCooldown / 60000}mins.`
    }
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
    .setColor(botColor)
    .setDescription(msge)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
  }
}

