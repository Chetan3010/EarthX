const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed, requireSessionConditions, getProgressBar } = require('../../../helper/utils');
const { useQueue } = require('discord-player');
const { BOT_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { errorLog } = require('../../../configs/logger');
const { cyanDot, bottomArrow, wait } = require('../../../configs/emojis');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['playagain'],
    data: new SlashCommandBuilder()
        .setName('replay')
        .setDescription("Replay the current track"),
    async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;

        try {            
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(` Replaying, please wait... ${wait}`)
                ]
            });
            
            // Rewind to 0:00
            const queue = useQueue(interaction.guild.id);
            await queue.node.seek(0);

            // Create success response
            await interaction.editReply({ embeds: [successEmbed(` Replaying current song - By ${interaction.user}`)] });
            setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT);

            // Check if there is a now-playing message to update
            if (queue.metadata?.nowPlaying) {
                const channel = queue.metadata.channel;
                const nowPlayingMessageId = queue.metadata.nowPlaying;

                try {
                    const nowPlayingMessage = await channel.messages.fetch(nowPlayingMessageId);
                    const embed = nowPlayingMessage.embeds[0];

                    const progressBarFieldIndex = embed.fields.findIndex(field => field.name === `${cyanDot} Progress ${bottomArrow}`);
                    if (progressBarFieldIndex !== -1) {
                        embed.fields[progressBarFieldIndex].value = getProgressBar(queue.node);
                    }

                    await nowPlayingMessage.edit({ embeds: [embed] });
                } catch (error) {
                    errorLog(error);
                }
            }
        } catch (error) {
            if(interaction.replied || interaction.deferred){
                await interaction.editReply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/replay\` command`)
                    ],
                    ephemeral: true
                });
            }else{
                await interaction.reply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/replay\` command`)
                    ],
                    ephemeral: true
                });
            }
            errorLog(error);
        }
    },
};
