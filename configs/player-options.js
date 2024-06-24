const {QueueRepeatMode} = require('./utils')

const playerOptions = {
    repeatMode: QueueRepeatMode.AUTOPLAY,
    noEmitInsert: true,
    //   preferBridgedMetadata: true,
    // disableBiquad: true,
    skipOnNoStream: true,
    // volume: ,
    leaveOnStop: false, //If player should leave the voice channel after user stops the player
    leaveOnStopCooldown: 300000, //Cooldown in ms
    leaveOnEnd: false, //If player should leave after the whole queue is over
    leaveOnEndCooldown: 300000, //Cooldown in ms
    leaveOnEmpty: false, //If the player should leave when the voice channel is empty
    leaveOnEmptyCooldown: 300000, //Cooldown in ms
    pauseOnEmpty: true,
    selfDeaf: true,
};

module.exports = playerOptions