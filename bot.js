const fs = require('node:fs');
require('dotenv').config()
const {token,spotifyClientId, spotifyClientSecret} = process.env

const DeezerExtractor = require("discord-player-deezer").default 
const TidalExtractor = require('discord-player-tidal').default

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { Player } = require('discord-player');
const {
	SpotifyExtractor,
	SoundCloudExtractor,
	YouTubeExtractor,
	AttachmentExtractor,
	AppleMusicExtractor,
	VimeoExtractor,
	ReverbnationExtractor
} = require('@discord-player/extractor');
// "youtube-ext", "ytdl-core <- current", "@distube/ytdl-core", "play-dl", "yt-stream"

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });

const player = new Player(client, {
	skipFFmpeg: false,
	ytdlOptions: {
		
		highWaterMark: 1<<25,
		filter: 'audioonly',
		quality: 'highestaudio',
		// liveBuffer: 40000
	}
});

(async () => {
	
	await player.extractors.register(YouTubeExtractor, {});
	// await player.extractors.register(DeezerExtractor)
	// await player.extractors.register(TidalExtractor);
	// await player.extractors.register(AppleMusicExtractor, {});
	// await player.extractors.register(SoundCloudExtractor, {});
	// await player.extractors.register(AttachmentExtractor, {});
	// await player.extractors.register(VimeoExtractor, {});
	// await player.extractors.register(ReverbnationExtractor, {});
	await player.extractors.register(
		SpotifyExtractor,
		{
		  clientId: spotifyClientId,
		  clientSecret: spotifyClientSecret
		}
	);
	await player.extractors.loadDefault();
})();


	//  player.extractors.register(YouTubeExtractor, {});
	//  player.extractors.register(DeezerExtractor)
	//  player.extractors.register(TidalExtractor);
	//  player.extractors.register(AppleMusicExtractor, {});
	//  player.extractors.register(SoundCloudExtractor, {});
	//  player.extractors.register(AttachmentExtractor, {});
	//  player.extractors.register(VimeoExtractor, {});
	//  player.extractors.register(ReverbnationExtractor, {});
	//  player.extractors.register(
	// 	SpotifyExtractor,
	// 	{
	// 	  clientId: spotifyClientId,
	// 	  clientSecret: spotifyClientSecret
	// 	}
	// );
	// player.extractors.loadDefault();

client.commands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.cooldowns = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync('./functions');
for( const folder of functionFolders){
	const functionFiles = fs
	.readdirSync(`./functions/${folder}`)
	.filter(file => file.endsWith('.js'))
	for(const file of functionFiles)
		require(`./functions/${folder}/${file}`)(client);
		
}

client.handleEvents();
client.handleCommands();
client.handleComponents();

client.login(token);