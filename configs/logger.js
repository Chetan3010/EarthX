const chalk = require("chalk");
const { separator } = require("./emojis");

const maxLevelLength = 10

const errorLog = (error) => {
    let msge = null
    if (error && error.stack) {
        const stackLines = error.stack.split("\n");
        const callerInfo = stackLines[1];
        msge = chalk.red(`${error.message} -> ${callerInfo}`)
    } else {
        msge = chalk.red(`${error.message || error} -> Unknown caller`)
    }
    console.log(`${chalk.cyan(`[${new Date().toLocaleTimeString()}]`)} ${chalk.redBright(`${'[ERROR]'.padEnd(maxLevelLength)}`)} : ${msge}`);
}

const cmdLog = (commandName, commandType, guildName, channelName, member) => {
    const time = chalk.cyan(`[${new Date().toLocaleTimeString()}]`)
    const cmd = chalk.white(`${'[CMD]'.padEnd(maxLevelLength)}`)
    const cmdName = chalk.cyanBright(`/${commandName}`)
    const cmdType = `(${commandType})`
    const guildN = guildName
    const channel = `#${channelName}`
    const user = member

    console.log(
        [`${time} ${cmd} : ${cmdName} ${cmdType}`,
            guildN,
            channel,
            user
        ].join(chalk.cyan.bold(` ${separator} `))
    )
};

const infoLog = (type, pos, content) => {

    const time = chalk.cyan(`[${new Date().toLocaleTimeString()}]`)
    const typeTitle = type === 'SUCCESS' ? chalk.greenBright(`${'[SUCCESS]'.padEnd(maxLevelLength)}`) : type === 'DEBUG' ? chalk.magenta(`${'[DEBUG]'.padEnd(maxLevelLength)}`) : chalk.blue(`${'[INFO]'.padEnd(maxLevelLength)}`)
    const line = pos === 'START' ? chalk.yellowBright(`[START]`) : pos === 'END' ? chalk.greenBright(`[END]`) : ''
    console.log(`${time} ${typeTitle} : ${line} ${content}`)
}

const warningLog = (content) => console.log(`${chalk.cyan(`[${new Date().toLocaleTimeString()}]`)} ${chalk.yellowBright(`${'[WARNING]'.padEnd(maxLevelLength)}`)} : ${content}`)

module.exports = { errorLog, cmdLog, infoLog, warningLog }