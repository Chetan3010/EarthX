const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { resume } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
  name: 'playerResume',
  async execute(queue, track, client) {
    try {
      if (queue.metadata?.pauseMsge) queue.metadata.channel.messages.delete(queue.metadata.pauseMsge)
       // Reset the flag
      if(queue.metadata.interaction.guild.members.me?.voice?.channel.members.size === 1) return; // Ignore this resume event
      
      queue.metadata.channel.send({
        embeds: [
          new EmbedBuilder()
            .setColor(botColor)
            .setDescription(`${resume} Player is resumed now.`)
        ]
      }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT))
    } catch (error) {
      errorLog('An error occured with player event!')
      console.log(error);
    }
  }
}