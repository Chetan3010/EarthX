const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed, requireSessionConditions } = require('../../helper/utils');
const { useQueue } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { errorLog } = require('../../configs/logger');
const { arrow, leftAngleDown } = require('../../configs/emojis');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['clearqueue'],
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Clear the entire queue"),

    async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;

        try {
            const queue = useQueue(interaction.guild.id);
            if (queue?.tracks.toArray().length === 0) {
                await interaction.reply({ embeds: [errorEmbed(` There is nothing in the queue nor playing anything`)] })
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
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
                    await interaction.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, ERROR_MSGE_DELETE_TIMEOUT);
                    errorLog(error)
                    return;
                }

                const updatedEmbed = new EmbedBuilder(embedObject);

                msg.edit({ embeds: [updatedEmbed] });
            }

            await interaction.reply({ embeds: [successEmbed(` The queue has been cleared - By ${interaction.user}`)] })

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/clear\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};