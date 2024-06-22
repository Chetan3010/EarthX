const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { successEmbed } = require("../../configs/utils");

module.exports = {
  name: 'audioTracksRemove',
  async execute(queue, tracks, client) {
    queue.metadata.channel.send({ embeds: [
      successEmbed(` Multiple tracks removed - **${ tracks.length }** tracks.`)
    ]}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
  }
}