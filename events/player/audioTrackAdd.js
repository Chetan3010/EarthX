const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { success } = require("../../configs/emojis");
const { usePlayer } = require("discord-player");

module.exports = {
  name: 'audioTrackAdd',
  async execute(queue, track, client) {
    const cp = usePlayer(queue)
    if(cp.isPlaying()){
      queue.metadata.channel.send({ embeds: [
        new EmbedBuilder()
          .setColor(botColor)
          .setDescription(`${success} Added to the queue **[${escapeMarkdown(track.cleanTitle || track.title)}](${track.url})** - \`${track.duration}\` By ${track.requestedBy}.`)
      ]});
    }else{
      return
    }
  }
}