const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const GuildModel = require("../../../schema/guild");
const { errorEmbed } = require('../../../helper/utils');
const { enabled, disabled } = require('../../../configs/emojis');
const { errorLog } = require('../../../configs/logger');
const { botColor } = require('../../../configs/config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prefix-commands')
        .setDescription('Enable or disable prefix commands for this server')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Enable or disable prefix commands')
                .setRequired(true)
                .addChoices(
                    { name: 'Enable', value: 'enable' },
                    { name: 'Disable', value: 'disable' }
                ))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        try {
            const status = interaction.options.getString('status') === 'enable' ? true : false;
            
            await GuildModel.findOneAndUpdate(
                { guildId: interaction.guild.id },
                { isPrefixCmdEnable: status },
                { upsert: true, new: true }
            );

            let msge = ''
            if (status) {
                msge = `${enabled} Prefix commands have been **[enabled](https://discord.com)** for this server.\nUse consistent command type else it will not perform as expected!`
            } else {
                msge = `${disabled} Prefix commands have been **[disabled](https://discord.com)** for this server.`
            }
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(msge)
                ]
            });
        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/prefix-commands\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    }
};
