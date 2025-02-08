const { useQueue } = require("discord-player");
const { requireSessionConditions, errorEmbed, successEmbed, saveSongEmbed } = require("../../../helper/utils");
const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");
const { wait, leftAngleDown, arrow } = require("../../../configs/emojis");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['dm'],
    data: {
        name: 'save',
        description: "Save the currently playing song's information to your DMs"
    },
    async execute(client, message, params) {
        try {

            if (!requireSessionConditions(message, true, false, false)) return;

            const queue = useQueue(message.guildId);
            if (!queue || !queue.isPlaying()) {
                return message.reply({ embeds: [errorEmbed(`No song is currently being player`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            const { currentTrack } = queue;
            if (!currentTrack) {
                return message.reply({ embeds: [errorEmbed(` Can't fetch information of currently playing song`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            // Resolve embed and create DM
            const save = saveSongEmbed(message, client, queue)
            const channel = await message.author.createDM().catch(() => null);
            if (!channel) {
                return message.reply({ embeds: [errorEmbed(` I don't have permission to DM you`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            // Try to send dm
            try {
                channel.send({ embeds: [save] });
            }
            catch {
                return message.reply({ embeds: [errorEmbed(`I don't have permission to DM you`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
            }

            // Feedback
            return message.reply({ embeds: [successEmbed(` [${escapeMarkdown(currentTrack.cleanTitle || currentTrack.title)}](${currentTrack.url}) song saved into your DMs`)] })
                .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [
                    errorEmbed(`Something went wrong while executing \`save-song\` command`)
                ],
            }).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT)).catch(err => errorLog(err));
        }
    },
};