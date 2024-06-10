const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('tip')
		.setDescription('Replies with top!'),
	async execute(interaction, client) {
        const message = await interaction.deferReply({
			fetchReply: true
		});
		const newMessage = `top!`;
		await interaction.editReply({
			content: newMessage
		})
	},
};