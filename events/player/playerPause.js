const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { pause } = require("../../configs/emojis");

module.exports = {
	name: 'playerPause',
	async execute(queue, track, client) {
		const res = await queue.metadata.channel.send({
			embeds: [
				new EmbedBuilder()
					.setColor(botColor)
					.setDescription(`${pause} Player is paused for now.`)
			]
		});
		queue.metadata.pauseMsge = res.id
	}
}