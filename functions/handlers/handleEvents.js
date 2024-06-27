const { useMainPlayer } = require('discord-player');
const fs = require('fs');
const { connection } = require('mongoose');
const { infoLog } = require('../../configs/logger');

module.exports = (client) => {
    client.handleEvents = async () => {
        const eventFolders = fs.readdirSync('./events');
        const player = useMainPlayer()
        for (const folder of eventFolders){
            const eventFiles = fs
            .readdirSync(`./events/${folder}`)
            .filter(file => file.endsWith('.js'));

            switch(folder){
                case "client":
                    infoLog('DEBUG','START', 'Client events loading...')
                    for (const file of eventFiles) {
                        const event = require(`../../events/${folder}/${file}`);
                        if(event.once) client.once(event.name, (...args) => event.execute(...args, client));
                        else client.on(event.name, (...args) => event.execute(...args, client));
                    }
                    infoLog('DEBUG','END', 'Client events loaded.')
                    break;
                case "player":
                    infoLog('DEBUG','START', 'Player events loading...')
                    for (const file of eventFiles) {
                        const event = require(`../../events/${folder}/${file}`);
                        if(event.on) player.on(event.name, (...args) => event.execute(...args, client));
                        else player.events.on(event.name, (...args) => event.execute(...args, client));
                    }
                    infoLog('DEBUG','END', 'Player events loaded.')
                    break;
                case "mongo":
                    infoLog('DEBUG','START', 'MongoDB events loading...')
                    for (const file of eventFiles) {
                        const event = require(`../../events/${folder}/${file}`);
                        if(event.once) connection.once(event.name, (...args) => event.execute(...args, client));
                        else connection.on(event.name, (...args) => event.execute(...args, client));
                    }
                    infoLog('DEBUG','END', 'MongoDB events loaded.')
                    break;
                default:
                    break;
            }
        }
    }
}