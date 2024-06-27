const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botColor } = require('../../configs/config');
const { errorEmbed } = require('../../helper/utils');
const { errorLog } = require('../../configs/logger');
const { default: mongoose } = require('mongoose');
const { cyanDot } = require('../../configs/emojis');

module.exports = {
	category: 'utility',
	cooldown: 60,
	aliases: ['latency'],
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with bot ping.'),
	async execute(interaction, client) {
		try {
			const start = Date.now();
			await mongoose.connection.db.command({ ping: 1 });
			const latency = Date.now() - start;
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
						.setDescription(`${cyanDot} My Latency: ${message.createdTimestamp - interaction.createdTimestamp} ms.\n${cyanDot} Database Latency: ${latency} ms.\n${cyanDot} Discord Api Latency: ${client.ws.ping} ms.`)
				]
			})

		} catch (error) {
			await interaction.editReply({
				embeds: [
					errorEmbed(`Something went wrong while executing \`/ping\` command`)
				],
				ephemeral: true
			});
			errorLog(error.message)
		}
	},
};