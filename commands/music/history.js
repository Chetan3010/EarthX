const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { queueEmbedResponse, errorEmbed } = require('../../configs/utils');
const { requireSessionConditions } = require('../../configs/music');
const { useHistory } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['h'],
	data: new SlashCommandBuilder()
		.setName('history')
		.setDescription('Display the current history.'),

	async execute(interaction, client) {
        if (!requireSessionConditions(interaction, true, false, false)) return;
        
        try {
            const history = useHistory(interaction.guild.id);
            if (!history) {
              interaction.reply({ embeds: [ errorEmbed(`History is currently empty`) ]})
              setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

              return;
            }

            // Show history, interactive
            queueEmbedResponse(interaction, history, 'History');

        }catch (error) {
            await interaction.reply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/history\` command`)
                    ],
                    ephemeral: true
                });
                errorLog(error.message)
          }
	},
};