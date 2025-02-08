const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../../helper/utils');
const { feedbackGuildId, feedbackChannelId, SECONDS_IN_ONE_MINUTE, MINUTES_IN_ONE_HOUR } = require('../../../helper/constants');
const { botColor } = require('../../../configs/config');
const { heartp } = require('../../../configs/emojis');
const { errorLog } = require('../../../configs/logger');

module.exports = {
    category: 'utility',
    cooldown: SECONDS_IN_ONE_MINUTE * MINUTES_IN_ONE_HOUR,
    aliases: [],
    data: new SlashCommandBuilder()
        .setName('feedback')
        .setDescription("Give your feedback or report bug with detailed info")
        .addStringOption(option =>
            option.setName('subject')
                .setDescription('Enter your subject or reason')
                .setRequired(true)
                .setMinLength(5)
                .setMaxLength(30))
        .addStringOption(option =>
            option.setName('title')
                .setDescription('Enter your title')
                .setRequired(true)
                .setMinLength(10)
                .setMaxLength(50))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Enter your detailed information about your issue')
                .setRequired(true)
                .setMinLength(26)
                .setMaxLength(256)),

    async execute(interaction, client) {
        const subject = interaction.options.getString('subject')
        const title = interaction.options.getString('title')
        const description = interaction.options.getString('description')

        if (!(subject && title && description)) {
            await interaction.reply({
                embeds: [errorEmbed(` You didn't provided the required fields`)]
            })
        }

        try {

            const guild = await client.guilds.fetch(feedbackGuildId);
            if (!guild) {
                await interaction.reply({
                    embeds: [errorEmbed(` Feedback is not supported yet, please contact developer directly`)],
                    ephemeral: true
                })
                return;
            }

            const channel = guild.channels.cache.get(feedbackChannelId) || await guild.channels.fetch(feedbackChannelId);
            if (!channel || !channel.isTextBased()) {
                await interaction.reply({
                    embeds: [errorEmbed(` Feedback is not supported yet, please contact developer directly`)],
                    ephemeral: true
                })
                return;
            }

            const invite = await interaction.guild.invites.create(interaction.channel.id, {
                maxAge: 0,
                reason: 'feedback support for bot',
                unique: true
            })

            await channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setAuthor({
                            name: `Feedback Support`,
                            iconURL: client.user.displayAvatarURL()
                        })
                        .setTitle(subject)
                        .setURL(invite.url)
                        .setFields(
                            {
                                name: `Guild id`,
                                value: interaction.guild.id
                            },
                            {
                                name: `Guild name`,
                                value: interaction.guild.name
                            },
                            {
                                name: `User id`,
                                value: interaction.user.id
                            },
                            {
                                name: `User name`,
                                value: interaction.user.tag || interaction.user.username
                            },
                            {
                                name: title,
                                value: `\`\`\`${description}\`\`\``,
                            },

                        )
                        .setFooter({
                            iconURL: interaction.user.displayAvatarURL(),
                            text: `${interaction.user.username}`
                        })
                        .setTimestamp()
                ]
            });

            await interaction.reply({
                embeds: [successEmbed(` Your feedback has been recorded. Thank you. ${heartp}`)]
            })

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/feedback\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    },
};