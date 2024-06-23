const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../configs/utils');
const { useQueue } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { requireSessionConditions } = require('../../configs/music');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['clearqueue'],
	data: new SlashCommandBuilder()
		.setName('clear')
		.setDescription("Clear the entire queue"),

	async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;

        try {
        const queue = useQueue(interaction.guild.id);
        if (!queue) {
            interaction.reply({ embeds: [ errorEmbed(` There is nothing in the queue nor playing anything`) ]})
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
        }
        queue.clear();
        await interaction.reply({ embeds: [ successEmbed(` The queue has been cleared - By ${interaction.user}`)]})
        
        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/clear\` command`)
                ],
                ephemeral: true
            });
            console.error(error)
        }
		
	},
};