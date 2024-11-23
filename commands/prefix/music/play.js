module.exports = {
    category: 'music',
    cooldown: 3,
    aliases: [],
    data: {
        name: 'play'
    },
    async execute(client, message, params) {
        console.log(client, message, params);
    },
};