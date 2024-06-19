const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    cooldown: 3,
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with Pong!'),
	async execute(interaction, client) {
		const message = await interaction.deferReply({
			fetchReply: true
		});

		const newMessage = `API Latency: ${client.ws.ping}\nClient Ping: ${message.createdTimestamp - interaction.createdTimestamp}`;
		await interaction.editReply({
			content: newMessage
		})
	},
};