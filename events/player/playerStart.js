const { errorLog } = require("../../configs/logger");
const { startedPlayingEmbed } = require("../../helper/utils");

module.exports = {
	name: 'playerStart',
	async execute(queue, track, client) {
		try {
			const np = await queue.metadata.channel.send({
				embeds: [
					startedPlayingEmbed(queue, track, client)
				]
			});

			queue.metadata.nowPlaying = np.id

			// const interval = setInterval(async () => {
			//   if (!queue.currentTrack) {
			//     clearInterval(interval);
			//     return;
			//   }

			//   try {
			//     // Fetch the message to ensure it still exists
			//     const embed = startedPlayingEmbed(queue, track, client);
			//     await np.edit({ embeds: [embed] });
			//   } catch (error) {
			//     console.log('Failed to fetch or edit message:', error);
			//     clearInterval(interval);
			//   }
			// }, 10000);

		} catch (error) {
			errorLog('An error occured with player event!')
			console.log(error);
		}
	}
}