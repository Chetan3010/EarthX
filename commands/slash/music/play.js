const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, requireSessionConditions } = require('../../../helper/utils');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { errorLog } = require('../../../configs/logger');
const { getGuildSettings } = require('../../../helper/db');
const { QueryType } = require('discord-player');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Play a song from YouTube with high quality audio')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Play a song. Search youtube or provide a direct link')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction, client) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!requireSessionConditions(interaction, false, true, false)) return;

        const query = interaction.options.getString('search');
        await interaction.deferReply();

        try {
            const searchResult = await player.search(query, { 
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            });

            if (!searchResult.hasTracks()) {
                await interaction.editReply({
                    embeds: [errorEmbed(`No track found for ${query}`)]
                }).catch(err => errorLog(err));
                
                try {
                    setTimeout(async () => {
                        if (interaction.replied || interaction.deferred) {
                            await interaction.deleteReply().catch(() => {});
                        }
                    }, ERROR_MSGE_DELETE_TIMEOUT);
                } catch (err) {
                    errorLog(err);
                }
                return;
            }

            const clientSettings = await getGuildSettings(interaction);
            await player.play(channel, searchResult, {
                requestedBy: interaction.user,
                nodeOptions: {
                    // Guild settings
                    repeatMode: clientSettings.repeatMode,
                    volume: clientSettings.volume,
                    leaveOnEmpty: clientSettings.leaveOnEmpty,
                    leaveOnEmptyCooldown: clientSettings.leaveOnEmptyCooldown,
                    leaveOnStop: clientSettings.leaveOnStop,
                    leaveOnStopCooldown: clientSettings.leaveOnStopCooldown,
                    leaveOnEnd: clientSettings.leaveOnEnd,
                    leaveOnEndCooldown: clientSettings.leaveOnEmptyCooldown,
                    pauseOnEmpty: clientSettings.pauseOnEmpty,
                    selfDeaf: clientSettings.selfDeaf,
                    
                    // Player settings
                    noEmitInsert: true,
                    skipOnNoStream: false,
                    bufferingTimeout: 15000,
                    smoothVolume: true,
                    volumeSmoothness: 0.08,
                    noFilterAboutVolume: true,
                    spotifyBridge: true,

                    // Audio quality settings
                    ffmpegFilters: [
                        'bass=g=4,dynaudnorm=f=200',
                        'acompressor=threshold=-12dB:ratio=16:attack=25:release=100',
                        'highpass=f=100,lowpass=f=16000',
                        'equalizer=f=100:t=h:w=200:g=4'
                    ],
                    opusEncodeOptions: {
                        frameSize: 60,
                        fec: true,
                        packetLoss: 1
                    },

                    metadata: {
                        channel: interaction.channel,
                        member: interaction.member,
                        timestamp: interaction.createdTimestamp,
                        interaction
                    }
                }
            });

            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.deleteReply().catch(() => {});
                }
            } catch (err) {
                errorLog(err);
            }

        } catch (error) {
            errorLog(error);
            try {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply({
                        embeds: [errorEmbed(`Something went wrong while executing \`/play\` command`)],
                        ephemeral: true
                    }).catch(() => {});
                }
            } catch (err) {
                errorLog(err);
            }
        }
    }
};