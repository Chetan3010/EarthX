const { useMainPlayer } = require('discord-player');
const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed } = require('../../configs/utils');
const { ERROR_MSGE_DELETE_TIMEOUT } = require('../../configs/constants');
const { requireSessionConditions } = require('../../configs/music');
const playerOptions = require('../../configs/player-options')

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['p'],
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays the song from youtube, spotify, etc.')
        .addStringOption( option => 
            option.setName('search')
                .setDescription('Play a song. Search youtube, spotify or provide a direct link.')
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

        if (!requireSessionConditions(interaction, false, true, false)) return;
        
        const query = interaction.options.getString('search')

        await interaction.deferReply()
        const searchResult = await player.search(query, { requestedBy: interaction.user });

        if (!searchResult.hasTracks()) {
            await interaction.editReply({
                embeds: [
                    errorEmbed(`No track found for ${query}`)
                ],
            });
            setTimeout(()=>{
                interaction.deleteReply()
            }, ERROR_MSGE_DELETE_TIMEOUT)
            return;
        } else {
            try {
                const {track} = await player.play(channel, searchResult, {
                    requestedBy: interaction.user,
                    nodeOptions: {
                        ...playerOptions,
                        metadata: {
                            channel: interaction.channel,
                            member: interaction.member,
                            timestamp: interaction.createdTimestamp
                        }
                    }
                });
                // console.log({...playerOptions});
                // const queue = useQueue(interaction.guild.id);
                // queue.setRepeatMode(3);
                // const cp = usePlayer(queue)
                // if(cp.isPlaying()){
                //     await interaction.deleteReply()
                // }else{
                    // await interaction.editReply({
                    //     embeds: [
                    //     new EmbedBuilder()
                    //         .setColor(botColor)
                    //         .setAuthor({
                    //             iconURL: client.user.displayAvatarURL(),
                    //             name: ` | Ready for playing ↴`,
                    //         })
                    //         .setDescription(`[${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\`.`)]  
                    // })
                    // setTimeout(() => {
                    //     interaction.deleteReply()
                    // }, BOT_MSGE_DELETE_TIMEOUT);
                // }
                // return
                await interaction.deleteReply()
            } catch (error) {
                await interaction.editReply({
                    embeds: [
                        errorEmbed(`Something went wrong while executing \`/play\` command`)
                    ],
                })
                setTimeout(()=>{
                    interaction.deleteReply()
                }, ERROR_MSGE_DELETE_TIMEOUT)
                console.error(error)
            }
        }
	},
};