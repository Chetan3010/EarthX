const { useQueue } = require("discord-player");
const { errorLog } = require("../../../configs/logger");
const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { leftAngleDown, arrow } = require("../../../configs/emojis");
const { EmbedBuilder, escapeMarkdown } = require("@discordjs/builders");

const FROM_OPTION_ID = 'from-position';
const TO_OPTION_ID = 'to-position';

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['mv'],
    data: {
        name: 'move-song',
        description: "Move a song from one position to another in the queue. Usage: move-song <from position> <to position>"
    },

    async execute(client, message, params) {

        const fromPosition = Number(params[0]) - 1 || null;
        const toPosition = Number(params[1]) - 1 || null;

        // Check state
        if (!requireSessionConditions(message, true)) return;

        try {

            // Better checking
            if (!fromPosition || !toPosition) {
                return message.reply({ embeds: [errorEmbed(` Please enter valid position number from 1`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }
            const queue = useQueue(message.guildId);

            console.log('Check 2');

            // Not enough songs in queue
            if ((queue?.size ?? 0) < 2) {
                return message.reply({ embeds: [errorEmbed(` Not enough songs in queue to perform any move action`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            // Check bounds/constraints
            const queueSizeZeroOffset = queue.size - 1;
            if (
                fromPosition > queueSizeZeroOffset
                || toPosition > queueSizeZeroOffset
            ) {

                return message.reply({
                    emebeds: [errorEmbed(` The \`${fromPosition > queueSizeZeroOffset
                        ? toPosition > queueSizeZeroOffset
                            ? `${FROM_OPTION_ID} and ${TO_OPTION_ID}\` parameters are both`
                            : FROM_OPTION_ID + '` parameter is'
                        : TO_OPTION_ID + '` parameter is'
                        } not within valid range of 1-${queue.size}`)]
                }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix move-to command!')
                    console.log(err);
                });
            }

            // Is same
            if (fromPosition === toPosition) {
                return message.reply({ emebeds: [errorEmbed(` \`${FROM_OPTION_ID}\` and \`${TO_OPTION_ID}\` are both identical`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occurred with prefix move-to command!')
                        console.log(err);
                    });
            }

            // Swap src and dest
            queue.moveTrack(fromPosition, toPosition);
            if (toPosition === 0) {
                if (queue.metadata?.nowPlaying) {
                    const { tracks } = queue;
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
                            .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                                errorLog('An error occurred with prefix move-to command!')
                                console.log(err);
                            });
                    }

                    const updatedEmbed = new EmbedBuilder(embedObject);

                    await msg.edit({ embeds: [updatedEmbed] });
                }
            }

            // use toPosition, because it's after #swap
            const firstTrack = queue.tracks.data.at(toPosition);
            return message.reply({ embeds: [successEmbed(` [${escapeMarkdown(firstTrack.title)}](${firstTrack.url}) song has been moved to position **\`${toPosition + 1}\`**`)] })
                .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                    errorLog('An error occurred with prefix move-to command!')
                    console.log(err);
                })
        }
        catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`move-to\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix move-to command!')
                console.log(err);
            });
        }
    },
};