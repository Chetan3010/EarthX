const { useMainPlayer } = require("discord-player");
const { errorLog } = require("../../configs/logger");

module.exports = {
    data: {
        name: 'help'
    },
    async autocomplete(interaction, client) {
        const query = interaction.options.getFocused();
        if (!query) return [];


        const { commands } = client;

        // Getting our search query's results
        const queryResult = commands.filter(
            (cmd) => cmd.data.name.toLowerCase().indexOf(query) >= 0
                || cmd.aliases.includes(query)
                // Filtering matches by category
                || cmd.category.toLowerCase().indexOf(query) >= 0
        );

        // Structuring our result for Discord's API
        const returnData = queryResult
            .map((cmd) => ({
                name: cmd.data.name, value: cmd.data.name
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

        try {
            await interaction.respond(
                returnData.slice(0, 25)
            );
        } catch (error) {
            errorLog(error.message)
        }
    },
}