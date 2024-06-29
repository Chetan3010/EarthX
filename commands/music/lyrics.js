const { useQueue } = require("discord-player");
const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const { errorEmbed, requireSessionConditions } = require("../../helper/utils");
const { lyricsExtractor } = require("@discord-player/extractor");
const { EMBED_DESCRIPTION_MAX_LENGTH, ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { botColor } = require("../../configs/config");
const { errorLog } = require("../../configs/logger");

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

    async execute(interaction, client) {
        let query = interaction.options.getString('query-lyrics') ?? interaction.options.getString('query-lyrics-no-auto-complete') ?? useQueue(interaction.guild.id)?.currentTrack?.title;
        await interaction.deferReply();
        if (!query) {
            await interaction.editReply({ embeds: [errorEmbed(`Please provide a query, currently playing song can only be used when playback is active`)] })
            setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
        }

        // Check state
        if (!requireSessionConditions(interaction, false, false, false)) return;
        // Let's defer the interaction as things can take time to process

        query &&= query.toLowerCase();
        const lyricsClient = lyricsExtractor()
        try {

            const res = await lyricsClient
                .search(query)
                .catch(() => null);

            if (!res) {
                await interaction.editReply({ embeds: [errorEmbed(`Could not find lyrics for **\`${query}\`**, please try a different query`)] })
                setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
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
            await interaction.editReply({ embeds: [lyricsEmbed] });

        } catch (error) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/lyrics\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }
    },
};