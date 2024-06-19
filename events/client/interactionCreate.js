const { Collection, InteractionType } = require("discord.js");

module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isChatInputCommand()){
			const { commands } = client;
			const { commandName } = interaction;
			const command = commands.get(commandName)

			// For message commandds aliases -> || commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

			if (!command) {
				console.error(`No command matching ${commandName} was found.`);
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
							console.log(error);
						}
					}, expirationTime - now )
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
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}else if(interaction.isButton()){
			const { buttons } = client;
			const { customId } = interaction;
			const button = buttons.get(customId)

			if(!button) return console.error("There is no code for this button.");

			try{
				await button.execute(interaction, client)
			}catch(error){
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this button!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this button!', ephemeral: true });
				}
			}
		}else if(interaction.isStringSelectMenu()){
			const { selectMenus } = client;
			const { customId } = interaction;
			const menu = selectMenus.get(customId)

			if(!menu) return console.error("There is no code for this menu.");

			try {
				await menu.execute(interaction, client);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this menu!', ephemeral: true });
				} else {
					await interaction.reply({ content: 'There was an error while executing this menu!', ephemeral: true });
				}
			}

		}else if(interaction.type == InteractionType.ApplicationCommandAutocomplete){
			const { commands } = client;
			const { commandName } = interaction;
			const command = commands.get(commandName);
			if(!command) return console.error("There is no code for this autocomplete.");

			try{
				await command.autocomplete(interaction, client)
			}catch( error){
				console.error(error)
			}
		}
	}
}