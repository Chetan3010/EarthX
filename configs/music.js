const { useQueue, usePlayer } = require("discord-player");
const { error, success } = require("./emojis");
const { errorEmbed } = require("./utils");

const requireSessionConditions = (
    interaction,
    requireVoiceSession = false,
    useInitializeSessionConditions = false,
    requireDJRole = false // Explicit set to false for public commands
  ) => {
    // Destructure
    const { guild, member } = interaction;
  
    // Return early
    // if (!requireMusicChannel(interaction)) return false;
    // if (requireDJRole && !requireDJ(interaction)) return false;
  
    // Check voice channel requirement
    const channel = member.voice?.channel;
    if (!channel) {
      interaction.reply({
        embeds: [
            errorEmbed(`Please join/connect to a voice channel first`)
        ],
        ephemeral: true
      });
      return false;
    }
  
    // Note outside of useInitializeSessionConditions because
    // this is logic that should be applied to all music commands
    // that control player/queue state
    //
    // Check is playing in different channel
    // Essentially makes sure a shared voice connection is required
    // when playing/applicable
    const queue = useQueue(guild.id);
    if (queue && queue.channel.id !== channel.id) {
      interaction.reply({
        embeds: [
            errorEmbed(`I'm already playing in <#${ queue.channel.id }>`)
        ],
        ephemeral: true
      });
      return false;
    }
  
    // Check if we can initialize the voice state/channel join
    // Has a dedicated spot in logic, should be used in commands separate
    // from #requireSessionConditions where it could be called before and after checking this logic
    // while it should be right here in the middle
    if (
      useInitializeSessionConditions === true
      && requireInitializeSessionConditions(interaction) !== true
    ) return false;
  
    // No queue
    else if (
      requireVoiceSession === true
      && !usePlayer(guild.id)?.queue
    ) {
      interaction.reply({
        embeds: [
            errorEmbed(`No music is currently being played - use \`/play\` command to play something first.`)
        ],
        ephemeral: true
      });
      return false;
    }
  
    // Ok, continue
    return true;
};

const requireInitializeSessionConditions = (interaction) => {
    // Destructure
    const { member } = interaction;
  
    // Check voice channel requirement
    const channel = member.voice?.channel;
  
    // Can't see channel
    if (!channel.viewable) {
      interaction.reply({
        embeds: [
            errorEmbed(`I don't have permission to see your voice channel - maybe I don't have permissions or something`)
        ],
        ephemeral: true
      });
      return false;
    }
  
    // Join channel
    if (!channel.joinable) {
      interaction.reply({
        embeds: [
            errorEmbed(`I don't have permission to join your voice channel - maybe I don't have permissions or something`)
        ],
        ephemeral: true
      });
      return false;
    }
  
    // Channel is full
    // channel.userLimit >= channel.members.size
    if (
      channel.full
      && !channel.members.some((m) => m.id === interaction.client.user.id)
    ) {
      interaction.reply({
        embeds: [
            errorEmbed(`Your voice channel is currently full.`)
        ],
        ephemeral: true
      });
      return false;
    }
  
    // Ok
    return true;
};



module.exports = {
    requireSessionConditions,
    requireInitializeSessionConditions
}


