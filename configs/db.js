
const GuildModel = require('../schema/guild')

const getGuildSettings = async (guildId, interaction) => {
    try {
        const settings = await GuildModel.findOne({ guildId })
        if (!settings) {
            const guild = new GuildModel({ guildId })
            const settings = await guild.save()
            return settings
        }
        return settings
    } catch (error) {
        const interactionWasAcknowledged = interaction.deferred || interaction.replied
        if (interactionWasAcknowledged) {
            await interaction.followUp({
                embeds: [
                    errorEmbed(`Something went wrong while interacting with database`)
                ],
                ephemeral: true
            })
        }
        else {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while interacting with database`)
                ],
                ephemeral: true
            })
        }
        errorLog(error.message)
    }
}

module.exports = {
    getGuildSettings
}