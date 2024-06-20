const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { clock } = require('../../configs/emojis');
const { botColor, errorColor } = require('../../configs/config');

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

        await interaction.deferReply({
			fetchReply: true
		});

		let time = ``
		if(days) time+=`${days} days, `
		if(hours) time+=`${hours} hours, `
		if(minutes) time+=`${minutes} minutes, `
		if(seconds) time+=`${seconds} seconds`

		try {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(botColor)
						.setDescription(`${clock} | ${client.user.username} has been online since \`${time}\`.`)
				]
			})
		} catch (error) {
			await interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(errorColor)
						.setDescription(`Something went wrong while executing this command.`)
				]
			})
			console.log(error);
		}
	},
};
