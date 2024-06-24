const chalk = require("chalk")
const { warningLog, infoLog } = require("../../configs/logger")

module.exports = {
    name: 'connecting',
    execute(){
        infoLog('INFO', 'START', `${chalk.green(`[ Database Status ]`)} --> ${chalk.yellow('Connecting...')}`)
    }
}