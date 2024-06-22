const { escapeMarkdown } = require("discord.js");
const { errorEmbed } = require("../../configs/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");

module.exports = {
  name: 'playerSkip',
  async execute(queue, track, reason) {
    if(reason){;
      if(reason === 'JUMPED_TO_ANOTHER_TRACK') return
      console.log(reason);
      queue.metadata.channel.send({ embeds: [
        errorEmbed(`Track skipped because the audio stream couldn't be extracted: **[${ escapeMarkdown(track.cleanTitle || track.title) }](${ track.url })**.`)
      ]}).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
    }else{
      return
    }
  }
}