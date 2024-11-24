const { REST, Routes } = require('discord.js')
const fs = require('fs')
const { warningLog, infoLog, errorLog } = require('../../configs/logger')
require('dotenv').config()
const { clientId, token } = process.env

module.exports = (client) => {
    client.handleCommands = async () => {
        const prefixCommandFolders = fs.readdirSync('./commands/prefix');
        for (const folder of prefixCommandFolders) {
            const commandFiles = fs
                .readdirSync(`./commands/prefix/${folder}`)
                .filter(file => file.endsWith('.js'))

            const { prefixCommands, prefixAliases } = client;
            for (const file of commandFiles) {
                const command = require(`../../commands/prefix/${folder}/${file}`);
                if ('data' in command && 'execute' in command) {
                    prefixCommands.set(command.data.name, command);
                if (command.aliases) {
                    for (const alias of command.aliases) {
                        prefixAliases.set(alias, command.data.name);
                    }
                }
                } else {
                    warningLog(`The prefix command at ${command} is missing a required "data" or "execute" property.`)
                }

            }

        }

        const slashCommandFolders = fs.readdirSync('./commands/slash');
        for (const folder of slashCommandFolders) {
            const commandFiles = fs
                .readdirSync(`./commands/slash/${folder}`)
                .filter(file => file.endsWith('.js'))

            const { slashCommands, commandArray } = client
            for (const file of commandFiles) {
                const command = require(`../../commands/slash/${folder}/${file}`);
                if ('data' in command && 'execute' in command) {
                    slashCommands.set(command.data.name, command);
                    commandArray.push(command.data.toJSON());
                } else {
                    warningLog(`The slash command at ${command} is missing a required "data" or "execute" property.`)
                }

            }

        }

        const rest = new REST().setToken(token)
        try {
            infoLog('DEBUG', 'START', `Started refreshing ${client.commandArray.length} application (/) commands.`)
            const data = await rest.put(
                Routes.applicationCommands(clientId),
                { body: client.commandArray },
            );
            infoLog('DEBUG', 'END', `Successfully reloaded ${data.length} application (/) commands.`)
        } catch (error) {
            errorLog(error);
        }

    }
}