const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, queueEmbedResponse, requireSessionConditions, successEmbed, startedPlayingMenu } = require('../../../helper/utils');
const { useQueue } = require('discord-player');
const { errorLog } = require('../../../configs/logger');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { leftAngleDown, arrow } = require('../../../configs/emojis');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
    data: new SlashCommandBuilder()
        .setName('shuffle')
        .setDescription("Shuffle the current queue"),
    async execute(interaction, client) {
        if (!requireSessionConditions(interaction, true)) return;

        try {
            const queue = useQueue(interaction.guild.id);
            const {currentTrack} = queue
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
                    await interaction.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, ERROR_MSGE_DELETE_TIMEOUT);
                    errorLog(error)
                    return;
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

            await interaction.reply({
                embeds: [
                    successEmbed('Queue has been shuffled. Use \`/queue\` to view shuffled queue.')
                ]
            })

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/shuffle\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};