const { escapeMarkdown } = require("discord.js");
const { errorEmbed } = require("../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
	name: 'playerSkip',
	async execute(queue, track, reason) {
		if (reason) {
			if (reason === 'JUMPED_TO_ANOTHER_TRACK' || 'SKIP_TO_ANOTHER_TRACK') return
			console.log(reason);
			await queue.metadata.channel.send({
				embeds: [
					errorEmbed(`Track skipped because the audio stream couldn't be extracted: **[${escapeMarkdown(track.cleanTitle || track.title)}](${track.url})**.`)
				]
			}).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(error => {
				errorLog('An error occured with player event!')
				console.log(error);
			})
		} else {
			return
		}
	}
}