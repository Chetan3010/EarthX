module.exports = {
  name: 'playerFinish',
  async execute(queue, track, client) {
    try {
        await queue.metadata.channel.messages.delete(queue.metadata.previousTrack)
      return
    } catch (error) {
        console.log(error);
    }
  }
}