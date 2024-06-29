const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { musicone, bottomArrow } = require("../../configs/emojis");
const { usePlayer } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
	name: 'audioTrackAdd',
	async execute(queue, track, client) {
		const cp = usePlayer(queue)
		if (cp.isPlaying()) {
			await queue.metadata.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(botColor)
						.setDescription(`${musicone} Added to the queue [${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\` By ${track.requestedBy}.`)
				]
			}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(error => {
				errorLog('An error occured with player event!')
				console.log(error);
			})

		} else {

			await queue.metadata.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(botColor)
						.setAuthor({
							iconURL: client.user.displayAvatarURL(),
							name: ` Ready for playing ${bottomArrow}`,
						})
						.setDescription(`[${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\` By - ${track.requestedBy}.`)]
			}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(error => {
				errorLog('An error occured with player event!')
				console.log(error);
			})
		}
	}
}