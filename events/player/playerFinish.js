const { errorLog } = require("../../configs/logger");

module.exports = {
    name: 'playerFinish',
    async execute(queue, track, client) {
        try {
            if (queue.metadata?.nowPlaying) {
                await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
            }

            if (queue.metadata?.updateInterval) {
                clearInterval(queue.metadata.updateInterval);
            }

            queue.metadata.nowPlaying = null;
            queue.metadata.updateInterval = null;
            queue.metadata.currentTrackId = null;

        } catch (error) {
            errorLog(error);
        }
    }
};
