const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { botColor } = require('../../configs/config');
const { errorEmbed, msToHumanReadableTime } = require('../../helper/utils');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'utility',
    cooldown: 120,
	aliases: [],
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription("Returns the bot's uptime!"),
	async execute(interaction, client) {
		try {
			interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(botColor)
						.setDescription(`:bar_chart: **[${client.user.username}](https://discord.com/)** has been online since \`${msToHumanReadableTime(Date.now() - client.readyTimestamp)}\`.`)
				]
			})
		} catch (error) {
			interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/uptime\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
		}
	},
};
