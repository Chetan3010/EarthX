const { SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    category: 'utility',
    cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Gives bot invite link'),
	async execute(interaction, client) {
        const button = new ButtonBuilder()
        .setCustomId('bot-invite')
        .setLabel('Click to invite.')
        .setStyle(ButtonStyle.Primary)

        await interaction.reply({
            components: [new ActionRowBuilder().addComponents(button)]
        })
    }
};