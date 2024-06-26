const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../helper/utils');
const { useMainPlayer, useQueue } = require('discord-player');
const { requireSessionConditions } = require('../../helper/music');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: '',
    cooldown: 3,
    aliases: [],
	data: new SlashCommandBuilder()
		.setName('play-next')
		.setDescription("Same as /play, but adds song to the front of the queue.")
        .addStringOption( option => 
            option.setName('search')
                .setDescription('Play a song. Search youtube, spotify or provide a direct link.')
                .setRequired(true)
                .setAutocomplete(true)
        ),

	async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;
        const player = useMainPlayer();
        const query = interaction.options.getString('search')
        // Let's defer the interaction as things can take time to process
        await interaction.deferReply();

        try {
        // Check is valid
        const searchResult = await player
            .search(query, { requestedBy: interaction.user })
            .catch(() => null);
        if (!searchResult.hasTracks()) {
            interaction.editReply({ embeds: [ errorEmbed(` No tracks found for search \`${ query }\``) ]})
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

            return;
        }

        // Ok
        const firstMatchTrack = searchResult.tracks.at(0);
        const queue = useQueue(interaction.guild.id);
        queue.addTrack(firstMatchTrack);

        // Swap first and last conditionally
        queue.swapTracks(0, queue.tracks.data.length - 1);
        interaction.editReply({ embeds: [ successEmbed(` [${ escapeMarkdown(firstMatchTrack.title) }](${ firstMatchTrack.url }) song has been added to the front of the queue - By ${interaction.user}`)]})
        setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

        }catch (error) {
            interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/play-next\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};