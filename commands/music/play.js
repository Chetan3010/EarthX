const { useMainPlayer, useQueue, usePlayer } = require('discord-player');
const { SlashCommandBuilder, EmbedBuilder, escapeMarkdown } = require('discord.js');
const { success, error } = require('../../configs/emojis');
const { botColor, errorColor } = require('../../configs/config');

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['p'],
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays the given song.')
        .addStringOption( option => 
            option.setName('song')
                .setDescription('Enter the name of the song')
                .setRequired(true)
                .setAutocomplete(true)
        ),
    
    async autocomplete(interaction, client){
        const player = useMainPlayer();
        const query = interaction.options.getFocused();
        if (!query) return [];
        const result = await player.search(query);

        const returnData = [];
        if (result.playlist) {
            returnData.push({
                name: 'Playlist | ' + result.playlist.title, value: query
            });
        }

        result.tracks
            .slice(0, 25)
            .forEach((track) => {
                let name = `${ track.title } | ${ track.author ?? 'Unknown' } (${ track.duration ?? 'n/a' })`;
                if (name.length > 100) name = `${ name.slice(0, 97) }...`;
                // Throws API error if we don't try and remove any query params
                let url = track.url;
                if (url.length > 100) url = url.slice(0, 100);
                return returnData.push({
                    name,
                    value: url
                });
            });
        
        try {
            await interaction.respond(
                returnData.slice(0, 25)
            );
        } catch (error) {
            console.error(error)
        }
    },

	async execute(interaction, client) {
        const player = useMainPlayer();
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply('You are not connected to a voice channel!');
        const query = interaction.options.getString('song')

        await interaction.deferReply()
        const searchResult = await player.search(query, { requestedBy: interaction.user });

        if (!searchResult.hasTracks()) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                    .setColor(errorColor)
                    .setDescription(`${error} NO track found for ${query}`)
                ]
            });
            return;
        } else {
            try {
                const {track} = await player.play(channel, searchResult, {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        skipOnNoStream: true,
                        leaveOnStop: false, //If player should leave the voice channel after user stops the player
                        leaveOnStopCooldown: 300000, //Cooldown in ms
                        leaveOnEnd: false, //If player should leave after the whole queue is over
                        leaveOnEndCooldown: 300000, //Cooldown in ms
                        leaveOnEmpty: false, //If the player should leave when the voice channel is empty
                        leaveOnEmptyCooldown: 300000, //Cooldown in ms
                        pauseOnEmpty: true,
                        selfDeaf: true,
                        metadata: {
                            channel: interaction.channel,
                            member: interaction.member,
                            timestamp: interaction.createdTimestamp
                        }
                    }
                });
                const queue = useQueue(interaction.guild.id);
                queue.setRepeatMode(3);
                const cp = usePlayer(queue)
                if(cp.isPlaying()){
                    await interaction.deleteReply()
                }else{
                    await interaction.editReply({
                        embeds: [
                        new EmbedBuilder()
                            .setColor(botColor)
                            .setAuthor({
                                iconURL: client.user.displayAvatarURL(),
                                name: ` | Ready for playing ↴`,
                            })
                            .setDescription(`[${escapeMarkdown(track.cleanTitle || track.title)}](${track.url}) - \`${track.duration}\` By ${track.requestedBy}.`)]  
                    })
                }
                return
            } catch (error) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor(errorColor)
                        .setDescription(`${error} Something went wrong while executing command!`)
                    ]
                });
                console.error(error)
            }
        }
	},
};