const chalk = require("chalk")
const { warningLog } = require("../../configs/logger")

module.exports = {
    name: 'disconnected',
    execute(){
        warningLog(`${chalk.green(`[ Database Status ]`)} --> ${chalk.red('Disconnected')}!`)
    }
}