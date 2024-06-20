const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { music, separator } = require("../../configs/emojis");

module.exports = {
  name: 'playerStart',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setAuthor({
          iconURL: client.user.displayAvatarURL(),
          name: `| Started Playing ↴`,
        })
        .setDescription(`[${ escapeMarkdown(track.title) }](${ track.url }) - \`${track.duration}\` By ${track.requestedBy}.`)
    ]});
  }
}