module.exports = {
    on: true,
    name: 'debug',
    async execute(message) {
        console.log(message);
    }
}