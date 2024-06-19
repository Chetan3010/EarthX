module.exports = {
    data: {
        name: "temp-menu"
    },
    async execute(interaction, client){
        await interaction.reply({
            content: `You selected: ${interaction.values[0]}`
        })
    }
}