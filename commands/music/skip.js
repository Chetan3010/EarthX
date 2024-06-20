const { usePlayer, TrackSkipReason } = require('discord-player');
const { SlashCommandBuilder, EmbedBuilder, escapeMarkdown } = require('discord.js');
const { errorColor, botColor } = require('../../configs/config');
const { error, success} = require('../../configs/emojis');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['next'],
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip the currently playing song.'),

	async execute(interaction, client) {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setColor(errorColor)
                .setDescription(`${error} You are not connected to a voice channel!`)
            ]
        });

        try {
            const guildPlayerNode = usePlayer(interaction.guild.id);

            const currentTrack = guildPlayerNode.queue.currentTrack;
            if (!currentTrack) {
              interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                    .setColor(errorColor)
                    .setDescription(`${ error }, No music is currently being played.`)
                ]})
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
            return
          }
          catch (e) {
            console.log(e);
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(errorColor)
                    .setDescription(`${error} Something went wrong while executing command!`)
                ]
            });
          }
	},
};