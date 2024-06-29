const { default: mongoose } = require("mongoose");

const guildSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        unique: true
    },
    guildName: {
        type: String,
    },
    // Volume System Default - 100
    volume: {
        type: Number,
        default: 100
    },
    // Repeat Mode : 0 - off, 1 - NA, 2 - NA, 3 - Autoplay
    repeatMode: {
        type: Number,
        enum: [0, 1, 2, 3],
        default: 0
    },
    // If the player should leave when the voice channel is empty
    leaveOnEmpty: {
        type: Boolean,
        default: true
    },
    //Cooldown in ms
    leaveOnEmptyCooldown: {
        type: Number,
        default: 300000
    },
    //If player should leave after the whole queue is over
    leaveOnEnd: {
        type: Boolean,
        default: false
    },
    //Cooldown in ms
    leaveOnEndCooldown: {
        type: Number,
        default: 300000
    },
    //If player should leave the voice channel after user stops the player
    leaveOnStop: {
        type: Boolean,
        default: false
    },
    //Cooldown in ms
    leaveOnStopCooldown: {
        type: Number,
        default: 300000
    },
    // If player should pause the playback when voice channel is empty
    pauseOnEmpty: {
        type: Boolean,
        default: true
    },
    // If player should self deaf 
    selfDeaf: {
        type: Boolean,
        default: true
    },
    // Player music channels Ids
    musicChannelIds: {
        type: Array,
        default: []
    },
    djRoleIds: {
        type: Array,
        default: []
    },
    equalizer: {
        type: String,
        default: 'null'
    }
})

module.exports = mongoose.model('guild', guildSchema, 'guilds')