const fs = require('fs')

module.exports = (client) => {
    client.handleComponents = async () => {
        const componentFolders = fs.readdirSync('./components')
        for (const folder of componentFolders) {
            const componentFiles = fs.readdirSync(`./components/${folder}`).filter(file => file.endsWith('.js'))

            const { buttons, selectMenus, autoComplete } = client;

            switch (folder) {
                case "buttons":
                    for (const file of componentFiles) {
                        const button = require(`../../components/${folder}/${file}`)
                        buttons.set(button.data.name, button)
                    }
                    break;
                case "selectMenus":
                    for (const file of componentFiles) {
                        const menu = require(`../../components/${folder}/${file}`)
                        selectMenus.set(menu.data.name, menu)
                    }
                    break;
                case "autoComplete":
                    for (const file of componentFiles) {
                        const autocomplete = require(`../../components/${folder}/${file}`)
                        autoComplete.set(autocomplete.data.name, autocomplete)
                    }
                    break;
                default:
                    break;
            }
        }
    }
}
