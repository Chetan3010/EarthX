const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../helper/constants");
const { errorLog } = require("../../configs/logger");
const { errorEmbed } = require("../../helper/utils");

module.exports = {
    name: 'playerError',
    async execute(queue, error) {
        console.log(error);
        await queue.metadata.channel.send({ embeds: [
            errorEmbed('Something went wrong with player. Sorry.')
        ]}).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT )).catch(error => {
            errorLog('An error occured with player event!')
        console.log(error);
        })
    }
}