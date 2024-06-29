const chalk = require("chalk");
const { infoLog } = require("../../configs/logger");

module.exports = {
	name: 'ready',
	on: true,
	async execute(client) {
		const upTimeStr = chalk.yellow(`${Math.floor(process.uptime()) || 1} second(s)`);

		infoLog('SUCCESS', "", `Client logged in as ${chalk.cyanBright(client.user.username)}${chalk.grey(`#${client.user.discriminator}`)} after ${upTimeStr}.`);

		// Calculating the membercount
		const memberCount = client.guilds.cache.reduce(
			(previousValue, currentValue) => previousValue += currentValue.memberCount, 0
		).toLocaleString('en-US');

		// Getting the server count
		const serverCount = (client.guilds.cache.size).toLocaleString('en-US');

		// Logging counts to developers
		infoLog('INFO', '', `Ready to serve ${memberCount} members across ${serverCount} servers.`);
	},
};