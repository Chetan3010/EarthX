const { errorLog } = require("../../configs/logger");

module.exports = {
  name: 'playerFinish',
  async execute(queue, track, client) {
    try {
        await queue.metadata.channel.messages.delete(queue.metadata.previousTrack)
      return
    } catch (error) {
      errorLog('An error occured with player event!')
      console.log(error);
    }
  }
}