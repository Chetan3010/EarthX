const { useMainPlayer, useQueue } = require('discord-player');
const { SlashCommandBuilder, EmbedBuilder, escapeMarkdown } = require('discord.js');
const { success } = require('../../configs/emojis');
const { botColor } = require('../../configs/config');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['p'],
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays the given song.')
        .addStringOption( option => 
            option.setName('song')
                .setDescription('Enter the name of the song')
                .setRequired(true)
        ),

	async execute(interaction, client) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply('You are not connected to a voice channel!');
        const query = interaction.options.getString('song')

        await interaction.deferReply()

        try {
            const {track} = await player.play(channel, query, {
                requestedBy: interaction.user,
                nodeOptions: {
                  skipOnNoStream: true,
                  leaveOnEnd: false,
                  leaveOnEmpty: false,
                  pauseOnEmpty: true,
                  selfDeaf: true,
                  metadata: {
                    channel: interaction.channel,
                    member: interaction.member,
                    timestamp: interaction.createdTimestamp
                  }
                }
            });
            const queue = useQueue(interaction.guild.id);
            queue.setRepeatMode(3);
            await interaction.editReply({
                embeds: [
                new EmbedBuilder()
                    .setColor(botColor)
                    .setDescription(`${success} Queued **[${escapeMarkdown(track.title)}](${track.url})** - \`${track.duration}\` By ${track.requestedBy}.`)]  
            })
            return
        } catch (error) {
            console.error(error)
        }
	},
};