const { useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, startedPlayingMenu, successEmbed } = require("../../../helper/utils");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { arrow, leftAngleDown } = require("../../../configs/emojis");
const { EmbedBuilder } = require("discord.js");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['mix'],
    data: {
        name: 'shuffle'
    },

    async execute(client, message) {

        // Check state
        if (!requireSessionConditions(message, true)) return;

        try {
            const queue = useQueue(message.guildId);
            const { currentTrack } = queue
            queue.tracks.shuffle();

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
                    await message.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    .then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                        errorLog('An error occured with prefix shuffle command!')
                        console.log(err);
                    })
                }

                const updatedEmbed = new EmbedBuilder(embedObject);
                const updatedSuggestionMenu = await startedPlayingMenu(queue, currentTrack)

                msg.edit({
                    embeds: [updatedEmbed],
                    components: [
                        updatedSuggestionMenu
                    ]
                });
            }

            await message.reply({
                embeds: [
                    successEmbed('Queue has been shuffled. Use \`queue\` to view shuffled queue')
                ]
            })
        } catch (error) {
            errorLog(error.message);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`shuffle\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occurred with prefix pause-resume command!')
                console.log(err);
            });
        }
    },
};