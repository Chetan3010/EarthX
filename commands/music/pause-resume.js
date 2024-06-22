const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed } = require('../../configs/utils');
const { requireSessionConditions } = require('../../configs/music');
const { usePlayer } = require('discord-player');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['stop'],
	data: new SlashCommandBuilder()
		.setName('pause-resume')
		.setDescription("Pause or resume the playback."),
	async execute(interaction, client) {
        // Check state
        if (!requireSessionConditions(interaction, true)) return;
        await interaction.deferReply()
    
        try {
          const guildPlayerNode = usePlayer(interaction.guild.id);
          const newPauseState = !guildPlayerNode.isPaused();
          guildPlayerNode.setPaused(newPauseState);
          await interaction.deleteReply()

        } catch (error) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/pause-resume\` command`)
                ],
                ephemeral: true
            });
            console.error(error)
        }
		
	},
};