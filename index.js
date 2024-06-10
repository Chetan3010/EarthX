const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config()

const { Client, Collection, GatewayIntentBits } = require('discord.js');
const {token} = process.env

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
client.buttons = new Collection()
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