const fs = require('node:fs');
require('dotenv').config()
const { token, spotifyClientId, spotifyClientSecret, mongoConnection } = process.env

const TidalExtractor = require('discord-player-tidal').default

const { Client, Collection, GatewayIntentBits, ActivityType, PresenceUpdateStatus } = require('discord.js');
const { Player } = require('discord-player');
const {
    SpotifyExtractor,
    SoundCloudExtractor,
    AttachmentExtractor,
    AppleMusicExtractor,
    VimeoExtractor,
    ReverbnationExtractor
} = require('@discord-player/extractor');
// "youtube-ext", "ytdl-core <- current", "@distube/ytdl-core", "play-dl", "yt-stream"

const { connect } = require('mongoose');
const chalk = require('chalk');
const { infoLog } = require('./configs/logger');
const { generateOauthTokens, YoutubeiExtractor } = require('discord-player-youtubei');
const { DeezerExtractor } = require('discord-player-deezer');

const client = new Client({
    presence: {
        status: PresenceUpdateStatus.Online,
        activities: [{ name: '/help', type: ActivityType.Listening }],
    },
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

const player = new Player(client, {
    skipFFmpeg: false,
    useLegacyFFmpeg: true,
    ytdlOptions: {
        highWaterMark: 1 << 25,
        filter: 'audioonly',
        quality: 'highestaudio',
        // liveBuffer: 40000
    }
});

const FFmpeg = require('prism-media').FFmpeg;
const ffmpegProcess = new FFmpeg({ /* FFmpeg options */ });
try {
    ffmpegProcess.destroy(); // Attempt to terminate the FFmpeg process
} catch (error) {
    if (error.code === 'EPERM') {
        infoLog('DEBUG',"",'Ensure the process has the necessary permissions to terminate FFmpeg.');
    }
    errorLog(error);
}

process.on('SIGINT', () => {
    infoLog('INFO', '', `Received SIGINT ${chalk.redBright('Ctrl-C')}`);
    infoLog('INFO', '', `Gracefully shutting down from SIGINT ${chalk.redBright('Ctrl-C')}`);
    process.exit(0);
});

(async () => {

    await player.extractors.register(YoutubeiExtractor, {
        streamOptions: {
            useClient: "ANDROID",
        }
    })
    await player.extractors.register(
        SpotifyExtractor,
        {
            clientId: spotifyClientId,
            clientSecret: spotifyClientSecret
        }
    );

    // Not a stable
    // await player.extractors.register(YouTubeExtractor, {});
    await player.extractors.register(DeezerExtractor); // Provide Decryption Key for extracting streams
    await player.extractors.register(TidalExtractor);
    await player.extractors.register(AppleMusicExtractor, {});
    await player.extractors.register(SoundCloudExtractor, {});
    await player.extractors.register(AttachmentExtractor, {});
    await player.extractors.register(VimeoExtractor, {});
    await player.extractors.register(ReverbnationExtractor, {});
    // await player.extractors.loadDefault();
})();

client.prefixCommands = new Collection();
client.prefixAliases = new Collection();
client.slashCommands = new Collection();
client.buttons = new Collection();
client.selectMenus = new Collection();
client.cooldowns = new Collection();
client.autoComplete = new Collection();
client.commandArray = [];

const functionFolders = fs.readdirSync('./functions');
for (const folder of functionFolders) {
    const functionFiles = fs
        .readdirSync(`./functions/${folder}`)
        .filter(file => file.endsWith('.js'))
    for (const file of functionFiles)
        require(`./functions/${folder}/${file}`)(client);
}

client.handleEvents();
client.handleCommands();
client.handleComponents();

(async () => {
    connect(mongoConnection).catch(error => console.log(error))
})()

client.login(token);