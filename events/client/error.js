const { Events } = require("discord.js");
const { errorLog } = require("../../configs/logger");

module.exports = {
	name: Events.Error,
	execute(error) {
		errorLog(error);
	},
};