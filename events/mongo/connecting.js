const chalk = require("chalk")
const { infoLog } = require("../../configs/logger")

module.exports = {
    name: 'connecting',
    execute(){
        infoLog('DEBUG', 'START', `${chalk.green(`[ Database Status ]`)} --> ${chalk.yellow('Connecting...')}`)
    }
}