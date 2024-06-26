const { useMainPlayer } = require("discord-player");
const { errorLog } = require("../../configs/logger");

module.exports = {
    data: {
        name: 'lyrics'
    },
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
            errorLog(error.message)
        }
    },   
}