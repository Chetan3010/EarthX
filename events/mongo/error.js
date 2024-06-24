const chalk = require("chalk");
const { errorLog } = require("../../configs/logger")

module.exports = {
    name: 'err',
    execute(err){
        errorLog(`${chalk.green(`[ Database Status ]`)} --> ${chalk.redBright('An error occured with mongo connection')}!`)
        console.log(err);
    }
}