const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { cyanDot, disk, arrow } = require("../../configs/emojis");
const { errorLog } = require("../../configs/logger");
const { QueueRepeatMode } = require("discord-player");

module.exports = {
  name: 'playerStart',
  async execute(queue, track, client) {
    try {
        const res = await queue.metadata.channel.send({ embeds: [
          new EmbedBuilder()
            .setColor(botColor)
            .setAuthor({
              iconURL: `https://media.discordapp.net/attachments/1253855563985584139/1253855637956329553/music.gif?ex=66775f8f&is=66760e0f&hm=4bb98ed7d4826424d9fda456900d08d6bfb27f7b295b86945dd20c733dab10cf&=&width=250&height=197`,
              name: `Started Playing ↴`
            })
            .setTitle(`${disk} ${track.title}`)
            .setURL(track.url)
            .setThumbnail(track.thumbnail)
            .addFields(
              { name: `${cyanDot} Duration`, value: `${arrow} ${track.duration}`, inline: true },
              { name: `${cyanDot} Artist`, value: `${arrow} ${track.author}`, inline: true },
              { name: `${cyanDot} Autoplay`, value: `${arrow} ${queue.repeatMode === QueueRepeatMode.AUTOPLAY ? 'On' : 'Off'}`, inline: true },
            )
            // .addFields(
            //   { name: `${cyanDot} Volume`, value: `┕> ${track.duration}`, inline: true },
            //   { name: `${cyanDot} Repeat Mode`, value: `┕> ${track.author}`, inline: true },
            //   { name: `${cyanDot} Autoplay`, value: `┕> ${queue.tracks.toArray().length} songs`, inline: true },
            // )
            .addFields(
              { name: `${cyanDot} Song link` , value: `${arrow} [Click here](${ track.url })`}
            )
            .setFooter({
              iconURL: client.user.displayAvatarURL(),
              text: `Requested by - ${track.requestedBy.username}.`
            })
            // .setDescription(`[${ escapeMarkdown(track.title) }](${ track.url }) - \`${track.duration}\` By ${track.requestedBy}.`)
        ]});
      queue.metadata.previousTrack = res.id
      return
    } catch (error) {
      errorLog('An error occured with player event!')
      console.log(error);
    }
  }
}