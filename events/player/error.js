const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorLog } = require("../../configs/logger");
const { errorEmbed } = require('../../configs/utils');

module.exports = {
    name: 'error',
    async execute(queue, error) {
        console.log(error);
        queue.metadata.channel.send({ embeds: [
            errorEmbed('Something went wrong with player queue. Sorry.')
        ]}).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT )).catch(error => {
            errorLog('An error occured with player event!')
        console.log(error);
        })
    }
}