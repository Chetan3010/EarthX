const { errorLog } = require("../../configs/logger");

module.exports = {
    name: 'error',
    async execute(queue, error) {
        errorLog(error);
    }
}