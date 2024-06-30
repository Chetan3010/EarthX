const { errorLog } = require("../../configs/logger");

module.exports = {
	name: 'playerFinish',
	async execute(queue, track, client) {
		try {
			if (queue.metadata?.nowPlaying) await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying)
				queue.metadata.nowPlaying = null
		} catch (error) {
			errorLog('An error occured with player event!')
			console.log(error);
		}
	}
}