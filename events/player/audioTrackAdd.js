const { EmbedBuilder, escapeMarkdown } = require("discord.js");
const { botColor } = require("../../configs/config");
const { musicone, bottomArrow, leftAngleDown, arrow } = require("../../configs/emojis");
const { usePlayer } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT, ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");
const { errorEmbed, startedPlayingMenu } = require("../../helper/utils");

module.exports = {
    name: 'audioTrackAdd',
    async execute(queue, track, client) {
        const cp = usePlayer(queue)
        if (cp.isPlaying()) {
            const position = queue.tracks.toArray().length - 1;
            await queue.metadata.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setDescription(`${musicone} Added to the queue [${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\` at ${position + 1} position - By ${track.requestedBy}.`)
                ]
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(error => {
                errorLog('An error occured with player event!')
                console.log(error);
            })

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
                    await interaction.editReply({ embeds: [errorEmbed(`Something went wrong while updating current track embed`)] })
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, ERROR_MSGE_DELETE_TIMEOUT);
                    errorLog(error)
                    return;
                }

                const updatedEmbed = new EmbedBuilder(embedObject);
                const updatedSuggestionMenu = await startedPlayingMenu(queue, track)

                msg.edit({
                    embeds: [updatedEmbed],
                    components: [
                        updatedSuggestionMenu
                    ]
                });
            }

        } else {

            await queue.metadata.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor(botColor)
                        .setAuthor({
                            iconURL: client.user.displayAvatarURL(),
                            name: ` Ready for playing ${bottomArrow}`,
                        })
                        .setDescription(`[${escapeMarkdown(track.title)}](${track.url}) - \`${track.duration}\` By - ${track.requestedBy}.`)]
            }).then(msge => setTimeout(() => msge.delete(), BOT_MSGE_DELETE_TIMEOUT)).catch(error => {
                errorLog('An error occured with player event!')
                console.log(error);
            })
        }
    }
}