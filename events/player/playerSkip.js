const { escapeMarkdown } = require("discord.js");
const { errorEmbed } = require("../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");

module.exports = {
	name: 'playerSkip',
	async execute(queue, error) {
		try {
			if (queue.metadata?.nowPlaying) {
				await queue.metadata.channel.messages.delete(queue.metadata.nowPlaying);
			}
		} catch (error) {
			errorLog(error);
		}
	}
}