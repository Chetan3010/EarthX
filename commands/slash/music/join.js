const { SlashCommandBuilder } = require("discord.js");
const { successEmbed, errorEmbed, requireSessionConditions } = require("../../../helper/utils");
const { useMainPlayer } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { getGuildSettings } = require("../../../helper/db");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['connect'],
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Let the bot join your voice channel'),

    async execute(interaction, client) {

        try {
            if (!requireSessionConditions(interaction, false, true, false)) return;

            if (interaction.guild.members.me?.voice?.channel === interaction.member.voice?.channel) {
                return interaction.reply({ embeds: [errorEmbed(`I'm already in <#${interaction.guild.members.me?.voice?.channel.id}> channel`)] })
            }
            const clientSettings = await getGuildSettings(interaction)
            const player = useMainPlayer();
            const queue = player.queues.create(interaction.guild.id, {
                repeatMode: clientSettings.repeatMode,
                noEmitInsert: true,
                skipOnNoStream: true,
                // preferBridgedMetadata: true,
                // disableBiquad: true,
                volume: clientSettings.volume,
                leaveOnEmpty: clientSettings.leaveOnEmpty, //If the player should leave when the voice channel is empty
                leaveOnEmptyCooldown: clientSettings.leaveOnEmptyCooldown, //Cooldown in ms
                leaveOnStop: clientSettings.leaveOnStop, //If player should leave the voice channel after user stops the player
                leaveOnStopCooldown: clientSettings.leaveOnStopCooldown, //Cooldown in ms
                leaveOnEnd: clientSettings.leaveOnEnd, //If player should leave after the whole queue is over
                leaveOnEndCooldown: clientSettings.leaveOnEmptyCooldown, //Cooldown in ms
                pauseOnEmpty: clientSettings.pauseOnEmpty,
                selfDeaf: clientSettings.selfDeaf,
                metadata: {
                    channel: interaction.channel,
                    member: interaction.member,
                    timestamp: interaction.createdTimestamp
                }
                // },
            });

            await queue.connect(interaction.member.voice.channel);

            await interaction.reply({
                embeds: [successEmbed(`Joined the <#${queue.channel.id}> channel`)],
            })
            setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)
            return

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/join\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    },
};