const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { resume } = require("../../configs/emojis");

module.exports = {
  name: 'playerResume',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      new EmbedBuilder()
        .setColor(botColor)
        .setDescription(`${resume} Player is paused for now.`)
    ]});
  }
}