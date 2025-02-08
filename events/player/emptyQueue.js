const { errorLog } = require("../../configs/logger");

module.exports = {
	name: 'emptyQueue',
	async execute(queue) {
		try {
			if (queue.metadata?.nowPlaying) {
				await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
			}
		} catch (error) {
			errorLog(error);
		}
	}
}