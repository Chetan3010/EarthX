const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, queueEmbedResponse, requireSessionConditions } = require('../../helper/utils');
const { useQueue } = require('discord-player');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
	data: new SlashCommandBuilder()
		.setName('shuffle')
		.setDescription("Shuffle the current queue"),
	async execute(interaction, client) {
        if (!requireSessionConditions(interaction, true)) return;

        try {
          const queue = useQueue(interaction.guild.id);
          queue.tracks.shuffle();
    
          // Show queue, interactive
          queueEmbedResponse(interaction, queue);

        } catch (error) {
            interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/shuffle\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
		
	},
};