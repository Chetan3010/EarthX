const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { greenDot, redDot } = require("../../configs/emojis");
const { errorLog } = require("../../configs/logger");

module.exports = {
  name: 'emptyChannel',
  async execute(queue, client) {
    let msge = ''
    if (!queue.options.leaveOnEmpty) msge = `${greenDot} Staying in channel as 24/7 is enabled.`
    else {
      if (queue.metadata?.previousTrack) queue.metadata.channel.messages.delete(queue.metadata.previousTrack)
      msge = `${redDot} Leaving empty channel in ${parseInt(queue.options.leaveOnEmptyCooldown / 60000)}mins.`
    }
    queue.metadata.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(botColor)
          .setDescription(msge)
      ]
    }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(error => {
      errorLog('An error occured with player event!')
      console.log(error);
    })
  }
}

