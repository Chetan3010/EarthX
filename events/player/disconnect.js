const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { sad } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
  name: 'disconnect',
  async execute(queue) {
    try {
      if(queue.metadata?.previousTrack) queue.metadata.channel.messages.delete(queue.metadata.previousTrack);
      queue.metadata.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(botColor)
            .setDescription(`${sad} Leaving the voice channel, Sayonara.`)
        ]
      }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT))
      return
    } catch (error) {
      errorLog('An error occured with player event!')
      console.log(error);
    }
  }
}