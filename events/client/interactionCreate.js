const { Collection, InteractionType } = require("discord.js");
const { errorLog, cmdLog, warningLog, infoLog } = require("../../configs/logger");
const chalk = require("chalk");
const { getRuntime } = require("../../configs/utils");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isChatInputCommand()) {
			const { commands } = client;
			const { commandName } = interaction;
			const command = commands.get(commandName)

			// For message commandds aliases -> || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) {
				warningLog(`No command matching ${commandName} was found.`)
				return;
			}

			const { cooldowns } = client;
			if (!cooldowns.has(command.data.name)) {
				cooldowns.set(command.data.name, new Collection());
			}

			const now = Date.now();
			const timestamps = cooldowns.get(command.data.name);
			const defaultCooldownDuration = 3;
			const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) {
					const expiredTimestamp = Math.round(expirationTime / 1000);
					await interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again after <t:${expiredTimestamp}:R>.`, ephemeral: true });
					setTimeout(async () => {
						try {
							await interaction.deleteReply()
						} catch (error) {
							errorLog(`An error occured while deleting cooldown reply.`)
							console.log(error);
						}
					}, expirationTime - now)
					return;
				}
			}

			timestamps.set(interaction.user.id, now);
			setTimeout(() => {
				timestamps.delete(interaction.user.id)
			}, cooldownAmount);

			try {
				await command.execute(interaction, client);
			} catch (error) {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
				errorLog(`An error has occurred while executing the ${chalk.redBright(`/${command.data.name}`)} command.`)
				console.error(error);
			}

			cmdLog(command.data.name, 'ApplicationCommand', interaction.guild.name, interaction.channel.name, interaction.member.user.username)
			// command.data.name commandType guild.name channel.name member.user.username
		} else if (interaction.isButton()) {
			const { buttons } = client;
			const { customId } = interaction;
			const button = buttons.get(customId)

			if (!button) { 
				// if (customId.startsWith('@')) {
				// 	const secondAtSignIndex = activeId.indexOf('@', 1);
				// 	const sliceEndIndex = secondAtSignIndex >= 0 ? secondAtSignIndex : activeId.length;
				// 	const dynamicCmd = button = getCommand(client, activeId.slice(1, sliceEndIndex));
				// 	if (!dynamicCmd) return; // Should be ignored
				// }
				if(customId.startsWith('@')) return
				return warningLog(`There is no code for ${customId} button.`) 
			}

			try {
				await button.execute(interaction, client)
			} catch (error) {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this button!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
				}
				errorLog(`An error has occurred while executing the button component.`)
				console.error(error);
			}
			cmdLog(button.data.name, 'ButtonComponent', interaction.guild.name, interaction.channel.name, interaction.member.user.username)

		} else if (interaction.isStringSelectMenu()) {
			const { selectMenus } = client;
			const { customId } = interaction;
			const menu = selectMenus.get(customId)

			if (!menu) return console.error("There is no code for this menu.");

			try {
				await menu.execute(interaction, client);
			} catch (error) {
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this menu!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this menu!', ephemeral: true });
				}
				errorLog(`An error has occurred while executing the menu component.`)
				console.error(error);
			}
			cmdLog(menu.data.name, 'SelectMenuComponent', interaction.guild.name, interaction.channel.name, interaction.member.user.username)

		} else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
			const { autoComplete } = client;
			const { commandName } = interaction;
			const command = autoComplete.get(commandName);
			if (!command) return warningLog(`There is no code for ${command.data.name} autocomplete.`)
			const autoResponseQueryStart = process.hrtime.bigint();
			const query = interaction.options.getFocused()?.toLowerCase() || '';
			try {
				await command.autocomplete(interaction, client)
			} catch (error) {
				errorLog(`Unknown error encountered while responding to autocomplete query in ${commandName}`)
				console.error(error)
			}
			// cmdLog(command.data.name, 'ApplicationCommandAutocomplete', interaction.guild.name, interaction.channel.name, interaction.member.user.username)
			infoLog('DEBUG', '', `<${chalk.cyanBright(commandName)}> | Auto Complete | Queried "${chalk.green(query)}" in ${getRuntime(autoResponseQueryStart).ms} ms`)
		}
	}
}
/*
`


*/