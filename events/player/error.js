const { ERROR_MSGE_DELETE_TIMEOUT } = require("../../configs/constants");
const { errorEmbed } = require('../../configs/utils');

module.exports = {
    name: 'error',
    async execute(queue, error) {
        console.log(error);
        queue.metadata.channel.send({ embeds: [
            errorEmbed('Something went wrong with player queue. Sorry.')
        ]}).then(msge => setTimeout(() => msge.delete(), ERROR_MSGE_DELETE_TIMEOUT )).catch(error => console.log(error))
    }
}