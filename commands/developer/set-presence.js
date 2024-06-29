const { SlashCommandBuilder, EmbedBuilder, PresenceUpdateStatus, ActivityType } = require('discord.js');
const { botColor } = require('../../configs/config');
const { errorEmbed } = require('../../helper/utils');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT, OWNERID } = require('../../helper/constants');
const { success } = require('../../configs/emojis');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'developer',
    cooldown: 120,
    aliases: ['activity'],
    data: new SlashCommandBuilder()
        .setName('set-presence')
        .setDescription("Sets the bot's presence activity")
        .addStringOption(option =>
            option.setName('status')
                .setDescription('The type of bot status')
                .setRequired(true)
                .addChoices(
                    { name: 'Online', value: PresenceUpdateStatus.Online },
                    { name: 'Idle', value: PresenceUpdateStatus.Idle },
                    { name: 'DoNotDisturb', value: PresenceUpdateStatus.DoNotDisturb },
                    { name: 'Invisible', value: PresenceUpdateStatus.Invisible },
                ))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of activity')
                .setRequired(true)
                .addChoices(
                    { name: 'Playing', value: 'PLAYING' },
                    { name: 'Streaming', value: 'STREAMING' },
                    { name: 'Listening', value: 'LISTENING' },
                    { name: 'Watching', value: 'WATCHING' },
                    { name: 'Competing', value: 'COMPETING' },
                    { name: 'Custom', value: 'CUSTOM' }
                ))
        .addStringOption(option =>
            option.setName('activity')
                .setDescription('The activity to set')
                .setRequired(true)),

    async execute(interaction, client) {

        try {
            if (interaction.user.id !== OWNERID) {
                return interaction.reply({
                    embeds: [
                        errorEmbed("You don't have permission to use this command")
                    ],
                    ephemeral: true
                })
            }

            const status = interaction.options.getString('status');
            const type = interaction.options.getString('type');
            const activity = interaction.options.getString('activity');

            const activityTypes = (type) => {
                if (type === "PLAYING") return ActivityType.Playing
                if (type === "STREAMING") return ActivityType.Streaming
                if (type === "LISTENING") return ActivityType.Listening
                if (type === "WATCHING") return ActivityType.Watching
                if (type === "COMPETING") return ActivityType.Competing
                if (type === "CUSTOM") return ActivityType.Custom
            }

            client.user.setPresence({
                activities: [{ name: activity, type: activityTypes(type) }],
                status: status
            });

            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(`${success} Bot presence updated to: ${type.toLowerCase()} ${activity} with ${status}.`)
                ]
            })

            setTimeout(() => {
                interaction.deleteReply()
            }, BOT_MSGE_DELETE_TIMEOUT)

        } catch (error) {
            interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/set-presence\` command`)
                ],
                ephemeral: true
            })
            errorLog(error)
        }
    },
};