const { useMainPlayer, usePlayer, useQueue } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed } = require('../../helper/utils');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { requireSessionConditions } = require('../../helper/music');
const { errorLog } = require('../../configs/logger');
const { getGuildSettings } = require('../../helper/db');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays the song from youtube, spotify, etc.')
        .addStringOption(option =>
            option.setName('search')
                .setDescription('Play a song. Search youtube, spotify or provide a direct link.')
                .setRequired(true)
                .setAutocomplete(true)
        ),

    async execute(interaction, client) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;

        if (!requireSessionConditions(interaction, false, true, false)) return;

        const query = interaction.options.getString('search')

        await interaction.deferReply()
        const searchResult = await player.search(query, { requestedBy: interaction.user });

        if (!searchResult.hasTracks()) {
            interaction.editReply({
                embeds: [
                    errorEmbed(`No track found for ${query}`)
                ],
            });
            setTimeout(() => {
                interaction.deleteReply()
            }, ERROR_MSGE_DELETE_TIMEOUT)
            return;
        } else {
            try {
                const clientSettings = await getGuildSettings(interaction.guild.id)
                // console.log(clientSettings);
                const { track } = await player.play(channel, searchResult, {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        
                        repeatMode: clientSettings.repeatMode,
                        // noEmitInsert: true,
                        skipOnNoStream: false,
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
                            timestamp: interaction.createdTimestamp,
                            interaction
                        }
                    }
                });

                // console.log({...playerOptions});
                // const queue = useQueue(interaction.guild.id);
                // console.log(queue);
                // queue.setRepeatMode(3);
                // const cp = usePlayer(queue)
                // console.log(cp)
                // if(cp.isPlaying()){
                //     await interaction.deleteReply()
                // }else{
                // await interaction.editReply({
                //     embeds: [
                //     new EmbedBuilder()
                //         .setColor(botColor)
                //         .setAuthor({
                //             iconURL: client.user.displayAvatarURL(),
                //             name: ` | Ready for playing ↴`,
                //         })
                //         .setDescription(`[${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\`.`)]  
                // })
                // setTimeout(() => {
                //     interaction.deleteReply()
                // }, BOT_MSGE_DELETE_TIMEOUT);
                // }
                // return
                interaction.deleteReply()
            } catch (error) {
                interaction.editReply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/play\` command`)
                    ],
                    ephemeral: true
                })
                errorLog(error.message)
            }
        }
    },
};