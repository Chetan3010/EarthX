const { errorLog } = require("../../configs/logger");
const { startedPlayingEmbed, getProgressBar } = require("../../helper/utils");

module.exports = {
    name: 'playerStart',
    async execute(queue, track, client) {
        try {
            const np = await queue.metadata.channel.send({
                embeds: [
                    startedPlayingEmbed(queue, track, client)
                ]
            });

            queue.metadata.nowPlaying = np.id;
            queue.metadata.currentTrackId = track.id;

            const interval = setInterval(async () => {
                if (!queue.currentTrack || queue.currentTrack.id !== queue.metadata.currentTrackId) {
                    clearInterval(interval);
                    try {
						await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
					} catch (error) {
						if (error.code === 10008) {
							return
							// Optionally handle or log this scenario
						} else {
							console.error('Failed to delete message:', error);
							// Handle other errors as needed
						}
					}
                    return;
                }

                try {
                    const progressBar = getProgressBar(queue.node);
                    const embed = np.embeds[0]; 

                    const progressBarFieldIndex = embed.fields.findIndex(field => field.name.includes('Progress'));
                    if (progressBarFieldIndex !== -1) {
                        embed.fields[progressBarFieldIndex].value = progressBar;
                    }

                    await np.edit({ embeds: [embed] });
                } catch (error) {
                    clearInterval(interval);
                }
            }, 10000);

            queue.metadata.updateInterval = interval;

        } catch (error) {
            errorLog('An error occurred with player event!');
            console.log(error);
        }
    }
}
