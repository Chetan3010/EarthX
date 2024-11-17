const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { musicone, bottomArrow, leftAngleDown, arrow } = require("../../configs/emojis");
const { usePlayer } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");
const { errorEmbed, startedPlayingMenu } = require("../../helper/utils");

module.exports = {
    name: 'audioTrackAdd',
    async execute(queue, track, client) {
        try {
            const cp = usePlayer(queue);
            if (cp.isPlaying()) {
                const position = queue.tracks.toArray().length - 1;
                await queue.metadata.channel.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(botColor)
                            .setDescription(`${musicone} Added to the queue [${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\` at ${position + 1} position - By ${track.requestedBy}.`)
                    ]
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT))
                .catch(error => {
                    errorLog('Failed to send track added message');
                });

                // Update now playing message if it exists
                if (queue.metadata?.nowPlaying) {
                    try {
                        const msg = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying)
                            .catch(() => null); // Return null if message not found

                        if (!msg) {
                            // Message not found, clear the nowPlaying reference
                            queue.metadata.nowPlaying = null;
                            return;
                        }

                        const { tracks } = queue;
                        const nextTrack = tracks.toArray()[0];
                        if (!nextTrack) return;

                        const embedObject = msg.embeds[0].toJSON();
                        const fieldIndex = embedObject.fields.findIndex(field => field.name === `${leftAngleDown} Next song`);

                        if (fieldIndex !== -1) {
                            embedObject.fields[fieldIndex].value = `${arrow} ${nextTrack ? `[${nextTrack.cleanTitle}](${nextTrack.url})` : 'No more songs in the queue.'}`;
                            
                            const updatedEmbed = new EmbedBuilder(embedObject);
                            const updatedSuggestionMenu = await startedPlayingMenu(queue, track);

                            await msg.edit({
                                embeds: [updatedEmbed],
                                components: [updatedSuggestionMenu]
                            }).catch(error => {
                                errorLog('Failed to update now playing message');
                                queue.metadata.nowPlaying = null; // Clear reference if update fails
                            });
                        }
                    } catch (error) {
                        errorLog('Error while handling now playing message update');
                        queue.metadata.nowPlaying = null;
                    }
                }
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
                }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT))
                .catch(error => {
                    errorLog('Failed to send ready for playing message');
                    console.error(error);
                });
            }
        } catch (error) {
            errorLog('An error occurred in audioTrackAdd event');
            console.error(error);
        }
    }
};