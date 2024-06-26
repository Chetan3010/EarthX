const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { errorEmbed, titleCase, getCommandOptions } = require('../../helper/utils');
const fs = require('fs');
const { botColor } = require('../../configs/config');
const { errorLog } = require('../../configs/logger');
const { cyanDot, cyanArrow, arrow } = require('../../configs/emojis');

module.exports = {
    category: 'utility',
    cooldown: 3,
    aliases: ['commands'],
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("To get information about all commands.")
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Select option to get detailed info about command')
                .setRequired(false)
                .setAutocomplete(true)
        ),

    async execute(interaction, client) {
        let query = interaction.options.getString('command')?.toLowerCase()
        await interaction.deferReply()
        let embed = null
        if (query) {
            const { commands } = client
            let cmdInfo = commands.get(query)
            if (!cmdInfo) {
                cmdInfo = commands.filter(cmd => cmd?.aliases.includes(query))?.values().next().value;
                if (!cmdInfo) {
                    interaction.editReply({
                        embeds: [errorEmbed(`I couldn't find the command \`/${query}\` or provide a valid command`)],
                        ephemeral: true
                    });
                    return;
                }
            }

            const { category, cooldown, aliases, data } = cmdInfo
            const { name, options, description } = data

            let optionFields = []
            if (options) {
                optionFields = [
                    { name: `${cyanDot} **Category**`, value: `${arrow} ${titleCase(category)}`, inline: false },
                    { name: `${cyanDot} **Cooldown**`, value: `${arrow} You can use this command once every ${cooldown} seconds.`, inline: false },
                    { name: `${cyanDot} **Aliases**`, value: `${arrow} ${aliases.join(" , ")}.`, inline: false },
                    { name: `${cyanDot} **Category**`, value: `${arrow} ${titleCase(category)}`, inline: false },
                    ...getCommandOptions(options)
                ]
            } else {
                optionFields = [
                    { name: `${cyanDot} **Category**`, value: `${arrow} ${titleCase(category)}`, inline: false },
                    { name: `${cyanDot} **Cooldown**`, value: `${arrow} You can use this command once every ${cooldown} seconds.`, inline: false },
                    { name: `${cyanDot} **Aliases**`, value: `${arrow} ${aliases.join(" , ")}.`, inline: false },
                    { name: `${cyanDot} **Category**`, value: `${arrow} ${titleCase(category)}`, inline: false },
                ]
            }
            embed = new EmbedBuilder()
                .setAuthor({
                    name: name,
                    iconURL: client.user.displayAvatarURL()
                })
                .setDescription(`${cyanArrow} ${description}`)
                .setFields(...optionFields)
                .setFooter({
                    iconURL: client.user.displayAvatarURL(),
                    text: `${client.user.username}`
                })
        } else {

            let fields = []
            let total = 0

            const folders = fs.readdirSync('./commands');
            for (const folder of folders) {
                const cmds = fs.readdirSync(`./commands/${folder}`)
                    .filter(file => file.endsWith('.js'))
                let commandArray = []
                for (const file of cmds) {
                    const cmd = require(`../../commands/${folder}/${file}`);
                    if ('data' in cmd && 'execute' in cmd) {
                        cmd.aliases.length > 0 ? commandArray.push(cmd.data.name, ...cmd.aliases) : commandArray.push(cmd.data.name)
                    } else {
                        warningLog(`The command at ${command} is missing a required "data" or "execute" property.`)
                    }

                }
                let field = { name: `${cyanDot} ${titleCase(folder)} [${commandArray.length}]`, inline: false, value: commandArray.map((item => `\`${item.replace('.js', '')}\``)).join(" , ") }
                fields.push(field)
                total += commandArray.length
            }
            embed = new EmbedBuilder()
                .setAuthor({
                    name: 'Help Menu',
                    iconURL: client.user.displayAvatarURL()
                })
                .setColor(botColor)
                .setDescription(`Use /help followed by a command option to get more additional information on a command. For example: /help play.`)
                .setFooter({
                    iconURL: client.user.displayAvatarURL(),
                    text: `${client.user.username} | Total commands: ${total}`
                })
                .setFields(fields)
        }
        try {
            interaction.editReply({ embeds: [embed] })
        } catch (error) {
            interaction.editReply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`/help\` command`)
                ],
                ephemeral: true
            });
            errorLog(error)
        }

    },
};

// setTimeout(()=> interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
