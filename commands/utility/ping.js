const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botColor } = require('../../configs/config');

module.exports = {
    category: 'utility',
    cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with bot ping.'),
	async execute(interaction, client) {
		const message = await interaction.deferReply({
			fetchReply: true
		});
		await interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(botColor)
					.setAuthor({
						iconURL: client.user.displayAvatarURL(),
						name: `${client.user.username}`
					})
					.setDescription(`My Latency: ${message.createdTimestamp - interaction.createdTimestamp} ms.\nDiscord Api Latency: ${client.ws.ping} ms.`)
			]
		})
	},
};