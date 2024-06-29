const fs = require('fs')
const { infoLog } = require('../../configs/logger')

module.exports = (client) => {
    client.handleComponents = async () => {
        const componentFolders = fs.readdirSync('./components')
        for (const folder of componentFolders) {
            const componentFiles = fs.readdirSync(`./components/${folder}`).filter(file => file.endsWith('.js'))

            const { buttons, selectMenus, autoComplete } = client;

            switch (folder) {
                case "buttons":
                    infoLog('DEBUG', 'START', 'Loading buttons components...')
                    for (const file of componentFiles) {
                        const button = require(`../../components/${folder}/${file}`)
                        buttons.set(button.data.name, button)
                    }
                    infoLog('DEBUG', 'END', 'Loading buttons completed.')
                    break;

                case "selectMenus":
                    infoLog('DEBUG', 'START', 'Loading select menus components...')
                    for (const file of componentFiles) {
                        const menu = require(`../../components/${folder}/${file}`)
                        selectMenus.set(menu.data.name, menu)
                    }
                    infoLog('DEBUG', 'END', 'Loading select menus completed.')
                    break;

                case "autoComplete":
                    infoLog('DEBUG', 'START', 'Loading application autocomplete components...')
                    for (const file of componentFiles) {
                        const autocomplete = require(`../../components/${folder}/${file}`)
                        autoComplete.set(autocomplete.data.name, autocomplete)
                    }
                    infoLog('DEBUG', 'END', 'Loading application autocomplete completed.')
                    break;
                    
                default:
                    break;
            }
        }
    }
}
