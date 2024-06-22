const { escapeMarkdown } = require("discord.js");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { successEmbed } = require("../../configs/utils");

module.exports = {
  name: 'audioTrackRemove',
  async execute(queue, track, client) {
    queue.metadata.channel.send({ embeds: [
      successEmbed(` Track removed - [${ escapeMarkdown(track.title) }](${ track.url })`)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
  }
}