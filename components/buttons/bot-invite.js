module.exports = {
    data: {
        name: 'bot-invite'
    },
    async execute(interaction, client) {
        await interaction.reply({
            content: `https://discord.com/oauth2/authorize?client_id=1249369732302377011&permissions=8&integration_type=0&scope=bot+applications.commands`
        })
    }
}