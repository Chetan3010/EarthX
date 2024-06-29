const { useMainPlayer } = require("discord-player");
const { errorLog } = require("../../configs/logger");

module.exports = {
    data: {
        name: 'play-next'
    },
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
            errorLog(error)
        }
    },
}