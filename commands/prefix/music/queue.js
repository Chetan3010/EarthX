const { requireSessionConditions, errorEmbed, successEmbed } = require("../../../helper/utils");
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require("../../../helper/constants");
const { errorLog } = require("../../../configs/logger");

module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: ['q'],
    data: {
        name: 'queue',
        description: "Display the current music queue"
    },
    async execute(client, message) {
        if (!requireSessionConditions(message, true)) return;

        try {
            const queue = client.player.nodes.get(message.guild.id);
            if (!queue?.isPlaying()) {
                return message.reply({ embeds: [errorEmbed(` Nothing is currently playing`)] })
                    .then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
                    .catch(err => errorLog(err));
            }

            const tracks = queue.tracks.map((track, index) => 
                `${index + 1}. **${track.title}** - Requested by: ${track.requestedBy}`
            );

            const currentTrack = queue.currentTrack;
            const queueString = tracks.length 
                ? `\n${tracks.join('\n')}`
                : ' No tracks in queue';

            return message.reply({
                embeds: [successEmbed(`
                    **Now Playing:**
                    ${currentTrack.title} - Requested by: ${currentTrack.requestedBy}
                    
                    **Queue:**${queueString}
                `)]
            }).then(msg => setTimeout(() => msg.delete(), BOT_MSGE_DELETE_TIMEOUT))
              .catch(err => errorLog(err));

        } catch (error) {
            errorLog(error);
            return message.reply({
                embeds: [errorEmbed(`Something went wrong while executing \`queue\` command`)]
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
              .catch(err => errorLog(err));
        }
    },
};