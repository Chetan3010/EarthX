const { useQueue, useMainPlayer } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { errorEmbed } = require("../../configs/utils");
const { requireSessionConditions } = require("../../configs/music");
const { lyricsExtractor } = require("@discord-player/extractor");
const { EMBED_DESCRIPTION_MAX_LENGTH, ERROR_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { botColor } = require("../../configs/config");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['ly'],
	data: new SlashCommandBuilder()
		.setName('lyrics')
		.setDescription('Display the lyrics for a specific song')
        .addStringOption(option => 
            option.setName('query-lyrics')
                .setDescription('The music to search/query')
                .setRequired(false)
                .setAutocomplete(true))
        .addStringOption(option => 
            option.setName('query-lyrics-no-auto-complete')
                .setDescription('The music to search/query - doesn\'t utilize auto-complete, meaning your query won\'t be modified')
                .setRequired(false)),
        
    async autocomplete(interaction, client){
        const player = useMainPlayer();
        const query = interaction.options.getFocused();
        if (!query) return [];
        const result = await player.search(query);

        const returnData = [];
        // Explicit ignore playlist

        // Format tracks for Discord API
        result.tracks
            .slice(0, 25)
            .forEach((track) => {
            let name = `${ track.title } by ${ track.author ?? 'Unknown' } (${ track.duration ?? 'n/a' })`;
            if (name.length > 100) name = `${ name.slice(0, 97) }...`;
            return returnData.push({
                name,
                value: `${ track.author ? track.author + ' ' : '' }${ track.title }`
                .toLowerCase()
                .replace(/(lyrics|extended|topic|vevo|video|official|music|audio)/g, '')
                .slice(0, 100)
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
        let query = interaction.options.getString('query-lyrics') ?? interaction.options.getString('query-lyrics-no-auto-complete') ?? useQueue(interaction.guild.id)?.currentTrack?.title;
        if (!query) {
            interaction.reply({ embeds: [ errorEmbed(`Please provide a query, currently playing song can only be used when playback is active`) ]})
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
        return;
        }

        // Check state
        if (!requireSessionConditions(interaction, false, false, false)) return;
        // Let's defer the interaction as things can take time to process
        await interaction.deferReply();
    
        query &&= query.toLowerCase();
        const lyricsClient = lyricsExtractor()
        try {

            const res = await lyricsClient
                .search(query)
                .catch(() => null);

            if (!res) {
                interaction.editReply({ embeds: [ errorEmbed(`Could not find lyrics for **\`${ query }\`**, please try a different query`) ]})
                setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                return;
            }

            const {
                title,
                fullTitle,
                thumbnail,
                image,
                url,
                artist,
                lyrics
            } = res;

            let description = lyrics;
            if (description && description.length > EMBED_DESCRIPTION_MAX_LENGTH) description = description.slice(0, EMBED_DESCRIPTION_MAX_LENGTH - 3) + '...';
            const lyricsEmbed = new EmbedBuilder()
                .setColor(botColor)
                .setTitle(title ?? 'Unknown')
                .setAuthor({
                name: artist.name ?? 'Unknown',
                url: artist.url ?? null,
                iconURL: artist.image ?? null
                })
                .setDescription(description ?? 'Instrumental')
                .setURL(url);

            if (image || thumbnail) lyricsEmbed.setImage(image ?? thumbnail);
            if (fullTitle) lyricsEmbed.setFooter({ text: fullTitle });

            // Feedback
            await interaction.editReply({ embeds: [ lyricsEmbed ] });

        }catch (error) {
            await interaction.editReply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/lyrics\` command`)
                    ],
                    ephemeral: true
                });
                console.error(error)
          }
	},
};