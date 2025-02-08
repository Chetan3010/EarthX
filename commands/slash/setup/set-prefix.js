const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildSettings = require('../../../schema/guild');
const { errorEmbed, successEmbed } = require('../../../helper/utils');
const { errorLog } = require('../../../configs/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-prefix')
        .setDescription('Set a new prefix for this server')
        .addStringOption(option =>
            option.setName('prefix')
                .setDescription('The new prefix to use')
                .setRequired(true)
                .setMaxLength(5))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const newPrefix = interaction.options.getString('prefix');

            // Don't allow spaces in prefix
            if (newPrefix.includes(' ')) {
                return interaction.reply({
                    embeds: [
                        errorEmbed('The prefix cannot contain spaces. Please choose a different prefix')
                    ],
                    ephemeral: true
                });
            }

            await GuildSettings.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { prefix: newPrefix },
                { upsert: true, new: true }
            );

            await interaction.reply({
                embeds: [successEmbed(`Successfully updated the prefix to \`${newPrefix}\``)]
            });
        } catch (error) {
            errorLog(error)
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/set-prefix\` command`)
                ],
                ephemeral: true
            });
        }
    }
};
