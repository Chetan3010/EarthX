const { errorLog } = require("../../configs/logger");

module.exports = {
	name: 'error',
	on: true,
	async execute(error) {
		errorLog(`Client event error occured.`)
		console.log(error);
	},
};