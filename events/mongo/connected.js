const chalk = require("chalk")
const { infoLog } = require("../../configs/logger")

module.exports = {
    name: 'connected',
    execute(){
        infoLog('DEBUG', 'END', `${chalk.green(`[ Database Status ]`)} --> ${chalk.greenBright('Conneted')}.`)
    }
}