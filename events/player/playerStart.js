const { useMainPlayer, Track } = require("discord-player");
const { errorLog } = require("../../configs/logger");
const { startedPlayingEmbed, getProgressBar, startedPlayingMenu, successEmbed, errorEmbed } = require("../../helper/utils");
const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'playerStart',
    async execute(queue, track, client) {
        try {
            const np = await queue.metadata.channel.send({
                embeds: [
                    startedPlayingEmbed(queue, track, client)
                ],
                components: [
                    await startedPlayingMenu(track)
                ]
            });
            
            const player = useMainPlayer();

            queue.metadata.nowPlaying = np.id;
            queue.metadata.currentTrackId = track.id;

            // Calculate collector duration based on track duration
            const collectorDuration = track.duration === '0:00' ? 3600000 : track.durationMS; // Use 1 hour for live streams

            // Create a collector for the menu interactions
            const collector = np.createMessageComponentCollector({ time: collectorDuration });

            collector.on('collect', async (interaction) => {
                if (interaction.customId === 'add_suggested_song') {
                    const selectedUrl = interaction.values[0];
                    try {
                        const result = await player.search(selectedUrl, {
                            requestedBy: interaction.user
                        });
                        if (!result.tracks.length) return;

                        const song = result.tracks[0];
                        await queue.addTrack(song);

                    } catch (error) {
                        errorLog(error);
                        await interaction.reply({
                            embeds: [errorEmbed('There was an error while adding the song to the queue.')],
                            ephemeral: true
                        }).then( setTimeout(() => {
                            interaction.deleteReply()
                        }, 5000))
                    }
                }
            });

            collector.on('end', () => {
                // Remove the components when the collector expires
                np.edit({ components: [] }).catch(console.error);
            });

            // const interval = setInterval(async () => {
            //     if (!queue.currentTrack || queue.currentTrack.id !== queue.metadata.currentTrackId) {
            //         clearInterval(interval);
            //         try {
            // 			await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
            // 		} catch (error) {
            // 			if (error.code === 10008) {
            // 				return
            // 				// Optionally handle or log this scenario
            // 			} else {
            // 				console.error('Failed to delete message:', error);
            // 				// Handle other errors as needed
            // 			}
            // 		}
            //         return;
            //     }

            //     try {
            //         const progressBar = getProgressBar(queue.node);
            //         const embed = np.embeds[0]; 

            //         const progressBarFieldIndex = embed.fields.findIndex(field => field.name.includes('Progress'));
            //         if (progressBarFieldIndex !== -1) {
            //             embed.fields[progressBarFieldIndex].value = progressBar;
            //         }

            //         await np.edit({ embeds: [embed] });
            //     } catch (error) {
            //         clearInterval(interval);
            //     }
            // }, 10000);

            // queue.metadata.updateInterval = interval;

        } catch (error) {
            errorLog('An error occurred with player event!');
            console.log(error);
        }
    }
}
