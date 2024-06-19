const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");

module.exports = {
  name: 'emptyChannel',
  async execute(queue, client) {
    let msge = ''

    if(!queue.leaveOnEmpty) msge = `Staying in channel as leaveOnEnd is disabled.`
    else{
      msge = `Leaving empty channel in ${ queue.leaveOnEmptyCooldown / 60000}mins.`
    }
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
    .setColor(botColor)
    .setDescription(msge)
    ]}); 
  }
}

