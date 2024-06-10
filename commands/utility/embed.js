const {SlashCommandBuilder, EmbedBuilder} = require('discord.js')

module.exports = {
        data: new SlashCommandBuilder()
        .setName("embed")
        .setDescription("Reply with embed!"),
        async execute(interaction, client){
            const embed = new EmbedBuilder()
                .setTitle("This is an embed")    
                .setDescription("THis is very cool description")
                .setColor(0x1abc9c)
                .setImage(client.user.displayAvatarURL())
                .setTimestamp(Date.now())
                .setAuthor({
                    iconURL: interaction.user.displayAvatarURL(),
                    name: interaction.user.tag
                })
                .setFooter({
                    iconURL: client.user.displayAvatarURL(),
                    text: interaction.user.tag
                })

        await interaction.reply({
            embeds: [embed]  
        })
    }
}