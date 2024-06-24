const chalk = require("chalk")
const { successLog, infoLog } = require("../../configs/logger")

module.exports = {
    name: 'connected',
    execute(){
        infoLog('INFO', 'END', `${chalk.green(`[ Database Status ]`)} --> ${chalk.greenBright('Conneted')}.`)
    }
}