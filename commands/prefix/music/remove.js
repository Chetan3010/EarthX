const { useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { wait, leftAngleDown, arrow } = require("../../../configs/emojis");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['rm'],
    data: {
        name: 'remove'
    },
    async execute(client, message, params) {
        try {

            const songPosition = Number(params[0]) - 1;

            // Check state
            if (!requireSessionConditions(message, true)) return;

            const queue = useQueue(message.guildId);

            // Not enough songs in queue
            if ((queue?.size ?? 0) < 2) {
                return message.reply({ embeds: [errorEmbed(` Not enough songs in the queue to remove`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred with prefix remove command!')
                        console.log(err);
                    });
            }

            // Check bounds/constraints
            const queueSizeZeroOffset = queue.size - 1;
            if (songPosition > queueSizeZeroOffset) {
                return message.reply({
                    embeds: [errorEmbed(` The \`${SONG_POSITION_OPTION_ID + '` Given position is'
                        } not within valid range of 1-${queue.size}`)]
                }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix replay command!')
                    console.log(err);
                });
            }

            // Remove song - assign track before #removeTrack
            const track = queue.tracks.data.at(songPosition);
            queue.removeTrack(songPosition);
            if (songPosition === 0) {
                if (queue.metadata?.nowPlaying) {
                    const { tracks } = queue
                    const nextTrack = tracks.toArray()[0]
                    if (!nextTrack) return
                    const msg = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying)
                    const embedObject = msg.embeds[0].toJSON();

                    // Find the field you want to update by name and update its value
                    const fieldIndex = embedObject.fields.findIndex(field => field.name === `${leftAngleDown} Next song`);
                    if (fieldIndex !== -1) {
                        embedObject.fields[fieldIndex].value = `${arrow} ${nextTrack ? `[${nextTrack.cleanTitle}](${nextTrack.url})` : 'No more songs in the queue.'}`
                    } else {
                        return message.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                            .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                                errorLog('An error occurred with prefix remove command!')
                                console.log(err);
                            });
                    }

                    const updatedEmbed = new EmbedBuilder(embedObject);

                    msg.edit({ embeds: [updatedEmbed] });
                }
            }
            return message.reply({ embeds: [successEmbed(` [${escapeMarkdown(track.title)}](${track.url}) has been removed from the queue - By ${message.author}`)] })
                .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix remove command!')
                    console.log(err);
                });

        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`remove\` command`)
                ],
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};