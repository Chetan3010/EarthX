const { SlashCommandBuilder } = require("discord.js");
const { requireSessionConditions } = require('../../configs/music');
const { successEmbed, errorEmbed } = require("../../configs/utils");
const { useQueue } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['disconnect'],
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Clear the queue and leaves the voice channel.'),

		async execute(interaction, client) {
 
            try {
                if (!requireSessionConditions(interaction, false, false, false)) return;
                const queue = useQueue(interaction.guild.id);
                if (!(queue && queue?.channel?.id)) {
                  interaction.reply({
                    embeds: [
                        errorEmbed(` I'm not connected to any voice channel`)
                    ],
                  });
                setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
                  return false;
                }
                if (!queue?.deleted) queue?.delete();
    
                interaction.reply({
                    embeds: [successEmbed(" Left the voice channel")],
                })
                setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)
                return
    
            }catch (error) {
                await interaction.reply({
                        embeds: [
                            errorEmbed(`Something went wrong while executing \`/leave\` command`)
                        ],
                        ephemeral: true
                });
                console.error(error)
            }
        },
}