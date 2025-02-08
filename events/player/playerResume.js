const { EmbedBuilder } = require("discord.js");
const { botColor } = require("../../configs/config");
const { resume, cyanDot, bottomArrow } = require("../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");
const { getProgressBar } = require("../../helper/utils");

module.exports = {
	name: 'playerResume',
	async execute(queue, track, client) {
		try {
			if (queue.metadata?.pauseMsge) queue.metadata.channel.messages.delete(queue.metadata.pauseMsge);

			if (!queue.metadata.interaction.guild.members.me?.voice?.channel || queue.metadata.interaction.guild.members.me.voice.channel.members.size === 1) return; // Ignore this resume event
			// Restart the interval updates
			// const interval = setInterval(async () => {
			// 	if (!queue.currentTrack || queue.currentTrack.id !== queue.metadata.currentTrackId) {
			// 		clearInterval(interval);
			// 		return;
			// 	}

			// 	try {
            //         const nowPlayingMessage = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying);
			// 		const embed = nowPlayingMessage.embeds[0];

            //         const progressBarFieldIndex = embed.fields.findIndex(field => field.name === `${cyanDot} Progress ${bottomArrow}`);
			// 		if (progressBarFieldIndex !== -1) {
			// 			embed.fields[progressBarFieldIndex].value = getProgressBar(queue.node);
			// 		}

			// 		await nowPlayingMessage.edit({ embeds: [embed] });
			// 	} catch (error) {
			// 		console.log(error);
			// 		clearInterval(interval);
			// 	}
			// }, 10000);

			// queue.metadata.updateInterval = interval;

			// Send resume message

			await queue.metadata.channel.send({
				embeds: [
					new EmbedBuilder()
						.setColor(botColor)
						.setDescription(`${resume} Player is resumed now.`)
				]
			}).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT));
		} catch (error) {
			errorLog(error);
		}
	}
}
