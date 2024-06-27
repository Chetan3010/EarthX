const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../helper/utils');
const { feedbackGuildId, feedbackChannelId, MS_IN_ONE_HOUR, SECONDS_IN_ONE_MINUTE, MINUTES_IN_ONE_HOUR } = require('../../helper/constants');
const { botColor } = require('../../configs/config');
const { heartp } = require('../../configs/emojis');


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
            interaction.reply({
                embeds: [errorEmbed(` You didn't provided the required fields`)]
            })
        }

        try {

            const guild = await client.guilds.fetch(feedbackGuildId);
            if (!guild) {
                interaction.reply({
                    embeds: [errorEmbed(` Guild not found, please contact developer`)],
                    ephemeral: true
                })
                return;
            }

            const channel = guild.channels.cache.get(feedbackChannelId) || await guild.channels.fetch(feedbackChannelId);
            if (!channel || !channel.isTextBased()) {
                interaction.reply({
                    embeds: [errorEmbed(` Channel not found or channel is not a text-based channel, please contact developer`)],
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

            interaction.reply({
                embeds: [successEmbed(` Your feedback has been recorded. Thank you. ${heartp}`)]
            })

        } catch (error) {
            interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/feedback\` command`)
                ],
                ephemeral: true
            });
            console.error(error)
        }

    },
};