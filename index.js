const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const {token} = process.env

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
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

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

client.login(token);