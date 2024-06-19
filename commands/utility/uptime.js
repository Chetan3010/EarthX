const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription("Returns the bot's uptime!"),
	async execute(interaction, client) {
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
            totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
            totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);
        const message = await interaction.deferReply({
			fetchReply: true
		});
		const newMessage = `I'm alive form ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`;
		await interaction.editReply({
			content: newMessage
		})
	},
};
