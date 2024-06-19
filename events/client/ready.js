module.exports = {
	name: 'ready',
	on: true,
	async execute(client) {
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};