const { useQueue } = require("discord-player");
const { SlashCommandBuilder } = require("discord.js");
const { errorEmbed, nowPlayingEmbed } = require("../../configs/utils");
const { requireSessionConditions } = require("../../configs/music");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['np'],
	data: new SlashCommandBuilder()
		.setName('now-playing')
		.setDescription("Displays the current playing song's detailed information."),
	async execute(interaction, client) {

        if (!requireSessionConditions(interaction, true, false, false)) return;

        try{
            const queue = useQueue(interaction.guild.id);
            if (!queue) {
                interaction.reply({ embeds: [ errorEmbed(` Queue is currently empty`)]})
                setTimeout(() => {
                    interaction.deleteReply()
                }, ERROR_MSGE_DELETE_TIMEOUT);
              return;
            }

            const { currentTrack } = queue;
            if (!currentTrack) {
                interaction.reply({ embeds: [ errorEmbed(`Can't fetch information of current playing song`)]})
                setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
              return;
            }
      
            const npEmbed = nowPlayingEmbed(queue);
            interaction.reply({ embeds: [ npEmbed ] });

        } catch (error) {
            await interaction.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/now-playing\` command`)
                ],
                ephemeral: true
            });
            errorLog(error.message)
        }
		
	},
};