const { SlashCommandBuilder, escapeMarkdown, EmbedBuilder } = require('discord.js');
const { errorEmbed, successEmbed, requireSessionConditions } = require('../../helper/utils');
const { useQueue } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../helper/constants');
const { errorLog } = require('../../configs/logger');
const { leftAngleDown, arrow } = require('../../configs/emojis');

const SONG_POSITION_OPTION_ID = 'song-position';

module.exports = {
	category: 'music',
	cooldown: 3,
	aliases: [],
	data: new SlashCommandBuilder()
		.setName('remove')
		.setDescription("Remove a song that is current in /queue by position")
		.addIntegerOption(option =>
			option.setName(SONG_POSITION_OPTION_ID)
				.setDescription('The position of the source song.')
				.setRequired(true)
				.setMinValue(1)
				.setMaxValue(999_999)
		),

	async execute(interaction, client) {
		const songPosition = Number(interaction.options.getInteger(SONG_POSITION_OPTION_ID)) - 1;

		// Check state
		if (!requireSessionConditions(interaction, true)) return;

		try {
			const queue = useQueue(interaction.guild.id);

			// Not enough songs in queue
			if ((queue?.size ?? 0) < 2) {
				await interaction.reply({ embeds: [errorEmbed(` Not enough songs in the queue to remove`)] });
				setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)

				return;
			}

			// Check bounds/constraints
			const queueSizeZeroOffset = queue.size - 1;
			if (songPosition > queueSizeZeroOffset) {
				await interaction.reply({
					embeds: [errorEmbed(` The \`${SONG_POSITION_OPTION_ID + '` Given position is'
						} not within valid range of 1-${queue.size}`)]
				});
				setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
				return;
			}

			// Remove song - assign track before #removeTrack
			const track = queue.tracks.data.at(songPosition);
			queue.removeTrack(songPosition);
			if (songPosition === 0) {
				if (queue.metadata?.nowPlaying) {
					const { tracks } = queue
					const nextTrack = tracks.toArray()[0]
					if (!nextTrack) return
					const msg = await queue.metadata.channel.messages.fetch(queue.metadata.nowPlaying)
					const embedObject = msg.embeds[0].toJSON();

					// Find the field you want to update by name and update its value
					const fieldIndex = embedObject.fields.findIndex(field => field.name === `${leftAngleDown} Next song`);
					if (fieldIndex !== -1) {
						embedObject.fields[fieldIndex].value = `${arrow} ${nextTrack ? `[${nextTrack.cleanTitle}](${nextTrack.url})` : 'No more songs in the queue.'}`
					} else {
						await interaction.reply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
						setTimeout(() => {
							interaction.deleteReply()
						}, ERROR_MSGE_DELETE_TIMEOUT);
						errorLog(error)
						return;
					}

					const updatedEmbed = new EmbedBuilder(embedObject);

					msg.edit({ embeds: [updatedEmbed] });
				}
			}
			await interaction.reply({ embeds: [successEmbed(` [${escapeMarkdown(track.title)}](${track.url}) has been removed from the queue - By ${interaction.user}`)] });
			setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

		} catch (error) {
			await interaction.reply({
				embeds: [
					errorEmbed(`Something went wrong while executing \`/remove\` command`)
				],
				ephemeral: true
			});
			errorLog(error)
		}

	},
};