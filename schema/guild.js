const { default: mongoose } = require("mongoose");

const guildSchema = new mongoose.Schema({
    guildId: String,
    guildName: String,
})

module.exports = mongoose.model('guild', guildSchema, 'guilds')