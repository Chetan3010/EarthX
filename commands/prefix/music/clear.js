const { useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, startedPlayingMenu, successEmbed } = require("../../../helper/utils");
const { leftAngleDown, arrow } = require("../../../configs/emojis");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { EmbedBuilder } = require("discord.js");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['c'],
    data: {
        name: 'clear',
        description: "Clear all songs from the current queue except the currently playing song"
    },

    async execute(client, message) {

        if (!requireSessionConditions(message, true)) return;

        try {
            const queue = useQueue(message.guildId);

            if (queue?.tracks.toArray().length === 0) {
                return message.reply({ embeds: [errorEmbed(` There is nothing in the queue nor playing anything`)] })
                .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            queue.clear();

            if (queue.metadata?.nowPlaying) {
                const { tracks } = queue
                const nextTrack = tracks.toArray()[0]
                const msg = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying)
                const embedObject = msg.embeds[0].toJSON();

                // Find the field you want to update by name and update its value
                const fieldIndex = embedObject.fields.findIndex(field => field.name === `${leftAngleDown} Next song`);
                if (fieldIndex !== -1) {
                    embedObject.fields[fieldIndex].value = `${arrow} ${nextTrack ? `[${nextTrack.cleanTitle}](${nextTrack.url})` : 'No more songs in the queue.'}`
                } else {
                    return message.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    .then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
                }

                const { currentTrack } = queue;
                const updatedEmbed = new EmbedBuilder(embedObject);
                const updatedSuggestionMenu = await startedPlayingMenu(queue, currentTrack)

                msg.edit({
                    embeds: [updatedEmbed],
                    components: [
                        updatedSuggestionMenu
                    ]
                });
            }

            return message.reply({ embeds: [successEmbed(` The queue has been cleared - By ${message.author}`)] })
            .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`clear\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};