const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, msToHumanReadableTime } = require('../../../helper/utils');
const { botColor } = require('../../../configs/config');
const { version } = require('discord.js');
const { BYTES_IN_KIB } = require('../../../helper/constants');
const { stripIndents } = require('common-tags');
const { greenDot, yellowDot, redDot, cyanDot, wait } = require('../../../configs/emojis');
const { errorLog } = require('../../../configs/logger');

const discordVersion = version.indexOf('dev') < 0 ? version : version.slice(0, version.indexOf('dev') + 3);
const discordVersionDocLink = `https://discord.js.org/#/docs/discord.js/v${discordVersion.split('.')[0]}/general/welcome`;
const nodeVersionDocLink = `https://nodejs.org/docs/latest-${process.version.split('.')[0]}.x/api/#`;

module.exports = {
    category: 'utility',
    cooldown: 60,
    aliases: [],
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription("Displays bot stats."),
    async execute(interaction, client) {

        const latency = Math.round(client.ws.ping);
        const sent = await interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setColor(botColor)
                    .setDescription(`${wait} Fetching stats...`)
            ],
            fetchReply: true
        });

        const fcLatency = sent.createdTimestamp - interaction.createdTimestamp;

        const getMsEmoji = (ms) => {
            let emoji = undefined;

            for (const [key, value] of Object.entries({
                250: greenDot,
                500: yellowDot,
                1000: redDot
            })) if (ms <= key) {
                emoji = value;
                break;
            }
            return (emoji ??= redDot);
        };

        // Memory Variables
        const memoryUsage = process.memoryUsage();
        const memoryUsedInMB = memoryUsage.heapUsed / BYTES_IN_KIB / BYTES_IN_KIB;
        const memoryAvailableInMB = memoryUsage.heapTotal
            / BYTES_IN_KIB / BYTES_IN_KIB;
        const objCacheSizeInMB = memoryUsage.external / BYTES_IN_KIB / BYTES_IN_KIB;

        // Replying to the interaction with our embed data
        try {
            await interaction.editReply({
                content: '\u200b',
                embeds: [
                    {
                        color: botColor,
                        author: {
                            name: `${client.user.username} Stats`,
                            iconURL: client.user.displayAvatarURL()
                        },
                        fields: [
                            {
                                name: `${cyanDot} Latency`,
                                value: stripIndents`
                ${getMsEmoji(latency)} **API Latency:** ${latency} ms
                ${getMsEmoji(fcLatency)} **Full Circle Latency:** ${fcLatency} ms
              `,
                                inline: true
                            },
                            {
                                name: `${cyanDot} Memory`,
                                value: stripIndents`
                💾 **Memory Usage:** ${memoryUsedInMB.toFixed(2)}/${memoryAvailableInMB.toFixed(2)} MB 
                ♻️ **Cache Size:** ${objCacheSizeInMB.toFixed(2)} MB
              `,
                                inline: true
                            },
                            {
                                name: `${cyanDot} Uptime`,
                                value: stripIndents`**📊 I've been online for ${msToHumanReadableTime(Date.now() - client.readyTimestamp)}**.`,
                                inline: false
                            },
                            {
                                name: `${cyanDot} System`,
                                value: stripIndents`
                ⚙️ **Discord.js Version:** [v${discordVersion}](${discordVersionDocLink})
                ⚙️ **Node Version:** [${process.version}](${nodeVersionDocLink})
              `,
                                inline: true
                            },
                            {
                                name: `${cyanDot} Stats`,
                                value: stripIndents`
                👥 **Servers:** ${client.guilds.cache.size.toLocaleString('en-US')}
                👤 **Users:** ${client.guilds.cache.reduce((previousValue, currentValue) => previousValue += currentValue.memberCount, 0).toLocaleString('en-US')}
              `,
                                inline: true
                            }
                        ],
                        footer: { text: client.user.username, icon_url: client.user.displayAvatarURL() },
                        timestamp: new Date().toISOString(),
                    }
                ]
            });

        } catch (error) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/stats\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    },
};
