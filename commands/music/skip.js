const { usePlayer, TrackSkipReason } = require('discord-player');
const { SlashCommandBuilder, EmbedBuilder, escapeMarkdown } = require('discord.js');
const { errorColor, botColor } = require('../../configs/config');
const { error, success} = require('../../configs/emojis');
const { requireSessionConditions } = require('../../configs/music');
const { BOT_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { errorEmbed } = require('../../configs/utils');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['next'],
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the currently playing song.'),

	async execute(interaction, client) {
        
        if (!requireSessionConditions(interaction, true)) return;

        try {
            const guildPlayerNode = usePlayer(interaction.guild.id);

            const currentTrack = guildPlayerNode.queue.currentTrack;
            if (!currentTrack) {
              interaction.reply({ 
                embeds: [
                    errorEmbed(`No music is currently being played`)
                ]})
                setTimeout(() => {
                    interaction.deleteReply()
                }, BOT_MSGE_DELETE_TIMEOUT);
              return;
            }

            const successSkip = guildPlayerNode.skip(TrackSkipReason);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(successSkip ? botColor : errorColor)
                        .setDescription(
                            successSkip 
                            ? `${ success } skipped **[${currentTrack }](${ currentTrack.url })** - By ${interaction.user}.`
                            : `${ error } , something went wrong - couldn't skip current playing song.`
                        )
                ]
            })
            setTimeout(() => {
                interaction.deleteReply()
            }, BOT_MSGE_DELETE_TIMEOUT);
            return
          }
          catch (error) {
            console.log(error);
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing command`)
                ], 
                ephemeral: true
            });
          }
	},
};