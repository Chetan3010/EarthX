module.exports = {
	name: 'interactionCreate',
	async execute(interaction, client) {
		if (interaction.isChatInputCommand()){
			const { commands } = client;
			const { commandName } = interaction;
			const command = commands.get(commandName)

			if (!command) {
				console.error(`No command matching ${commandName} was found.`);
				return;
			}
		
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

			if(!button) return console.error("There is no code for this button");

			try{
				await button.execute(interaction, client)
			}catch(err){
				console.error(err);
			}
		}
	}
}