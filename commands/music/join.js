const { SlashCommandBuilder } = require("discord.js");
const { requireSessionConditions } = require('../../configs/music');
const { successEmbed, errorEmbed } = require("../../configs/utils");
const { useMainPlayer } = require("discord-player");
const playerOptions = require('../../configs/player-options');
const { BOT_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['connect'],
	data: new SlashCommandBuilder()
		.setName('join')
		.setDescription('Let the bot join your voice channel.'),

	async execute(interaction, client) {
 
        try {
            if (!requireSessionConditions(interaction, false, true, false)) return;
            
            if(interaction.guild.members.me?.voice?.channel === interaction.member.voice?.channel){
                return interaction.reply({ embeds: [errorEmbed(`I'm already in <#${interaction.guild.members.me?.voice?.channel.id}> channel`)]})
            }
            const player = useMainPlayer();
            const queue = player.queues.create(interaction.guild.id, {
                ...playerOptions,
                metadata: {
                    channel: interaction.channel,
                    member: interaction.member,
                    timestamp: interaction.createdTimestamp
                },
                selfDeaf: true,
            });

            await queue.connect(interaction.member.voice.channel);

            interaction.reply({
                embeds: [successEmbed(`Joined the <#${queue.channel.id}> channel`)],
            })
            setTimeout(()=> interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)
            return

        }catch (error) {
            await interaction.reply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/join\` command`)
                    ],
                    ephemeral: true
            });
            console.error(error)
        }
    },
};