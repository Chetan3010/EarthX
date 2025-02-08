const { errorLog } = require("../../configs/logger");

module.exports = {
    name: 'error',
    execute(err) {
        errorLog(err);
    }
}