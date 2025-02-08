const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed, requireSessionConditions } = require('../../../helper/utils');
const { useMainPlayer, useQueue } = require('discord-player');
const GuildModel = require('../../../schema/guild');
const { errorLog } = require('../../../configs/logger');
const { botColor } = require('../../../configs/config');
const { disabled, enabled } = require('../../../configs/emojis');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
    data: new SlashCommandBuilder()
        .setName('247')
        .setDescription("Toggle 247 mode and stays in the vc even if song end and empty channel"),
    async execute(interaction, client) {
        try {
            if (!requireSessionConditions(interaction, false, true, false)) return;

            const clientSettings = await GuildModel.findOne({ guildId: interaction.guild.id })
            clientSettings.leaveOnEmpty = !clientSettings.leaveOnEmpty
            await clientSettings.save()

            const queue = useQueue(interaction.guild.id)
            if (queue) {
                queue.options.leaveOnEmpty = clientSettings.leaveOnEmpty
            } else {
                if (!clientSettings.leaveOnEmpty) {
                    const player = useMainPlayer();
                    const queue = player.queues.create(interaction.guild.id, {
                        // requestedBy: interaction.user,
                        // nodeOptions: {
                        repeatMode: clientSettings.repeatMode,
                        // noEmitInsert: true,
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
                }
            }

            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(`${clientSettings.leaveOnEmpty ? disabled : enabled} 24/7 mode is now **${clientSettings.leaveOnEmpty ? 'disabled' : 'enabled'}**.`)
                ]
            })

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/247\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};
