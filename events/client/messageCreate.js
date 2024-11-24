const { BOT_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { getGuildSettingsForMessage } = require("../../helper/db");
const { errorEmbed } = require("../../helper/utils");

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        const clientSettings = await getGuildSettingsForMessage(message)

        const { prefix } = clientSettings;
        if (!message.guild) return;
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
        let command = message.content.toLocaleLowerCase().split(" ")[0].slice(prefix.length);
        let params = message.content.split(" ").slice(1);
        let cmd;
        if (client.prefixCommands.has(command)) {
            cmd = client.prefixCommands.get(command);
        } else if (client.prefixAliases.has(command)) {
            cmd = client.prefixCommands.get(client.prefixAliases.get(command));
        }
        if (cmd) {
            cmd.execute(client, message, params);
        } else {
            message.reply({
                embeds: [
                    errorEmbed(`Please check supported command list by typing or using \`help\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog('An error occured in messageCreate event!')
                console.log(err);
            })
        }

    }
}
/*
`


*/