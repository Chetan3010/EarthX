const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed } = require('../../helper/utils');
const { requireSessionConditions } = require('../../helper/music');
const { useHistory } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { errorLog } = require('../../configs/logger');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
	data: new SlashCommandBuilder()
		.setName('play-previous')
		.setDescription("Plays the previous song right away"),

	async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;

        try {
        // No prev track
        const history = useHistory(interaction.guild.id);
        if (!history?.previousTrack) {
            interaction.reply({ embeds: [ errorEmbed(` No tracks in history`)]});
            setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
            return;
        }

        // Ok
        await history.previous();
        await interaction.reply({ embeds: [ successEmbed(` Playing previous song requested by - ${interaction.user}`)]});
        setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/play-previous\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};