const { Events } = require("discord.js");
const { cmdLog, errorLog } = require("../../configs/logger");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { getGuildSettingsForMessage } = require("../../helper/db");
const { errorEmbed } = require("../../helper/utils");

module.exports = {
    name: Events.MessageCreate,
    async execute(message, client) {
        const clientSettings = await getGuildSettingsForMessage(message)
        const { prefix, isPrefixCmdEnable } = clientSettings;
        if (!message.guild) return;
        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;
        if (!isPrefixCmdEnable) {
            return message.reply({
                embeds: [
                    errorEmbed(` Prefix commands are disabled in this server.\nEnable it using \`/prefix-commands\` slash command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        };
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
            cmdLog(cmd.data.name, 'PrefixCommand', message.guild.name, message.channel.name, message.member.user.username)
        } else {
            message.reply({
                embeds: [
                    errorEmbed(`Please check supported command list by typing or using \`help\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(err => {
                errorLog(err);
            })
        }

    }
}
