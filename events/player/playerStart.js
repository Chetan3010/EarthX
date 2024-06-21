const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");

module.exports = {
  name: 'playerStart',
  async execute(queue, track, client) {
    try {
        const res = await queue.metadata.channel.send({ embeds: [
          new EmbedBuilder()
            .setColor(botColor)
            .setAuthor({
              iconURL: client.user.displayAvatarURL(),
              name: `| Started Playing ↴`,
            })
            .setDescription(`[${ escapeMarkdown(track.title) }](${ track.url }) - \`${track.duration}\` By ${track.requestedBy}.`)
        ]});
      queue.metadata.previousTrack = res.id
      return
    } catch (error) {
        console.log(error);
    }
  }
}