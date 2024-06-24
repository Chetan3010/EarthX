const {REST,Routes} = require('discord.js')
const fs = require('fs')
const { warningLog, infoLog } = require('../../configs/logger')
require('dotenv').config()
const {clientId, token} = process.env
// const guildId = process.env.GUILD_ID

module.exports = (client) => {
    client.handleCommands = async () => {
        const commandFolders = fs.readdirSync('./commands');
        for (const folder of commandFolders ){
            const commandFiles = fs
            .readdirSync(`./commands/${folder}`)
            .filter(file => file.endsWith('.js'))

            const { commands, commandArray} = client
            for(const file of commandFiles){
                const command = require(`../../commands/${folder}/${file}`);
                if ('data' in command && 'execute' in command) {
                    commands.set(command.data.name, command);
                    commandArray.push(command.data.toJSON());
                } else {
                    warningLog(`The command at ${command} is missing a required "data" or "execute" property.`)
                }

            }

        }

        const rest = new REST().setToken(token)
        try {
            infoLog('DEBUG','START',`Started refreshing ${client.commandArray.length} application (/) commands.`)
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray },
            );
            infoLog('DEBUG','END',`Successfully reloaded ${data.length} application (/) commands.`)
        } catch (error) {
            console.error(error);
        }
        
    }
}