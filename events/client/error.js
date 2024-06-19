module.exports = {
	name: 'error',
	on: true,
	async execute(error) {
		console.log(error.message);
	},
};