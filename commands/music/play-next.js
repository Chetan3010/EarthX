const { SlashCommandBuilder, escapeMarkdown } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../configs/utils');
const { useMainPlayer, useQueue } = require('discord-player');
const { requireSessionConditions } = require('../../configs/music');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');

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
    async autocomplete(interaction, client){
        const player = useMainPlayer();
        const query = interaction.options.getFocused();
        if (!query) return [];
        const result = await player.search(query);

        const returnData = [];
        if (result.playlist) {
            returnData.push({
                name: 'Playlist | ' + result.playlist.title, value: query
            });
        }

        result.tracks
            .slice(0, 25)
            .forEach((track) => {
                let name = `${ track.title } | ${ track.author ?? 'Unknown' } (${ track.duration ?? 'n/a' })`;
                if (name.length > 100) name = `${ name.slice(0, 97) }...`;
                // Throws API error if we don't try and remove any query params
                let url = track.url;
                if (url.length > 100) url = url.slice(0, 100);
                return returnData.push({
                    name,
                    value: url
                });
            });
        
        try {
            await interaction.respond(
                returnData.slice(0, 25)
            );
        } catch (error) {
            console.error(error)
        }
    },

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
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/play-next\` command`)
                ],
                ephemeral: true
            });
            console.error(error)
        }
		
	},
};