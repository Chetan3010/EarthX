const { errorEmbed } = require("../../helper/utils");
const { errorLog } = require("../../configs/logger");
const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");

module.exports = {
    name: 'playerError',
    async execute(queue, error) {
        try {
            errorLog(error);
            await queue.metadata.channel.send({
                embeds: [errorEmbed(`An error occurred while playing music: ${error.message}`)]
            }).then(msg => setTimeout(() => msg.delete(), ERROR_MSGE_DELETE_TIMEOUT))
              .catch(err => errorLog(err));
        } catch (err) {
            errorLog(err);
        }
    },
};