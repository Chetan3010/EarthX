const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed, repeatModeEmojiStr, requireSessionConditions } = require('../../helper/utils');
const { useQueue } = require('discord-player');
const { errorLog } = require('../../configs/logger');
const GuildModel = require('../../schema/guild');
const { cyanDot, arrow, leftAngleDown } = require('../../configs/emojis');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['repeat'],
    data: new SlashCommandBuilder()
        .setName('repeat-mode')
        .setDescription("Configure specific repeat-mode or disable it")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Select the mode to set')
                .setRequired(false)
                .addChoices(
                    { name: 'off', value: '0' },
                    { name: 'song', value: '1' },
                    { name: 'queue', value: '2' },
                    { name: 'autoplay', value: '3' }
                ))
        .addBooleanOption(option =>
            option.setName('persistent')
                .setDescription('Save the selected repeat mode. Applies selected repeat mode to new sessions too')
                .setRequired(false)),

    async execute(interaction, client) {
        const repeatMode = Number(interaction.options.getString('mode')) ?? 0
        const shouldSave = interaction.options.getBoolean('persistent') ?? false

        // Check state
        if (!requireSessionConditions(interaction)) return;
        try {
            await interaction.deferReply()
            const queue = useQueue(interaction.guild.id);
            if (!queue) {
                await interaction.editReply({ embeds: [errorEmbed(` No music is being played - initialize a session first to set mode.`)] })
                setTimeout(() => {
                    interaction.deleteReply()
                }, ERROR_MSGE_DELETE_TIMEOUT);
                return;
            }

            // Resolve repeat mode
            queue.setRepeatMode(repeatMode);
            const modeEmoji = repeatModeEmojiStr(repeatMode);

            if (queue.metadata?.nowPlaying) {

                const msg = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying)
                const embedObject = msg.embeds[0].toJSON();

                // Find the field you want to update by name and update its value
                const fieldIndex = embedObject.fields.findIndex(field => field.name === `${leftAngleDown} Repeat mode`);
                if (fieldIndex !== -1) {
                    embedObject.fields[fieldIndex].value = `${arrow} ${repeatModeEmojiStr(queue.repeatMode)}`;
                } else {
                    await interaction.editReply({ embeds: [ errorEmbed(`Something went wrong while updating current track embed`)]})
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, ERROR_MSGE_DELETE_TIMEOUT);
                    errorLog(error)
                    return;
                }

                const updatedEmbed = new EmbedBuilder(embedObject);

                msg.edit({ embeds: [updatedEmbed] });
            }

            // Save for persistency
            if (shouldSave) {
                const settings = await GuildModel.findOne({ guildId: interaction.guild.id })
                settings.repeatMode = repeatMode;
                await settings.save()
            }

            // Feedback
            await interaction.editReply({ embeds: [successEmbed(`Updated ${shouldSave ? 'server' : 'current'} repeat mode to: ${modeEmoji}`)] });
        }
        catch (error) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/repeat-mode\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};