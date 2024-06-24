const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../configs/utils');
const { requireSessionConditions } = require('../../configs/music');
const { useQueue } = require('discord-player');
const { BOT_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [''],
	data: new SlashCommandBuilder()
		.setName('replay')
		.setDescription("Replay the current track"),
	async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;

        try {
        // Rewind to 0:00
            const queue = useQueue(interaction.guild.id);
            queue.node.seek(0);
            await interaction.reply({ embeds: [ successEmbed(` Replaying current song - By ${interaction.user}`)]});    
            setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/replay\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};