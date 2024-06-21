const { stripIndents } = require("common-tags");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, escapeMarkdown } = require("discord.js");
const { botColor, errorColor } = require("./config");
const { error, music, mode, sad } = require("./emojis");

const handlePagination = async (
    interaction,
    member,
    usableEmbeds,
    activeDurationMs = 60000 * 3,
    shouldFollowUpIfReplied = false
  ) => {
    let pageNow = 1;
    const prevCustomId = `@page-prev@${ member.id }@${ Date.now() }`;
    const nextCustomId = `@page-next@${ member.id }@${ Date.now() }`;
  
    const initialCtx = {
      embeds: [ usableEmbeds[pageNow - 1] ],
      components: getPaginationComponents(pageNow, usableEmbeds.length, prevCustomId, nextCustomId),
      fetchReply: true
    };
    const replyFunction = dynamicInteractionReplyFn(interaction, shouldFollowUpIfReplied);
    const interactionMessage = await replyFunction
      .call(interaction, initialCtx)
      .catch((err) => {
        console.log('Error encountered while responding to interaction with dynamic reply function:');
        console.dir({
          pageNow,
          prevCustomId,
          nextCustomId,
          initialCtx
        });
        console.error(err);
      });
  

    // Button reply/input collector
    const paginationCollector = interactionMessage.createMessageComponentCollector({
      filter: (i) => (
      // Filter out custom ids
        i.customId === prevCustomId || i.customId === nextCustomId
      ), // Filter out people without access to the command
      componentType: ComponentType.Button,
      time: activeDurationMs
    });
  
    // Reusable update
    const updateEmbedReply = (i) => i.update({
      embeds: [ usableEmbeds[pageNow - 1] ],
      components: getPaginationComponents(pageNow, usableEmbeds.length, prevCustomId, nextCustomId)
    });
  
    // And finally, running code when it collects an interaction (defined as "i" in this callback)
    paginationCollector.on('collect', (i) => {
      if (handlePaginationButtons(
        i,
        member,
        pageNow,
        prevCustomId,
        nextCustomId,
        usableEmbeds
      ) !== true) return;
  
      // Prev Button - Go to previous page
      if (i.customId === prevCustomId) pageNow--;
      // Next Button - Go to next page
      else if (i.customId === nextCustomId) pageNow++;
  
      // Update reply with new page index
      updateEmbedReply(i);
    });
  
    paginationCollector.on('end', () => {
      interaction.editReply({ components: getPaginationComponents(
        pageNow,
        usableEmbeds.length,
        prevCustomId,
        nextCustomId,
        true
      ) }).catch(() => { /* Void */ });
    });
};

const QueueRepeatMode = {
    /**
     * Disable repeat mode.
     */
    OFF : 0,
    /**
     * Repeat the current track.
     */
    TRACK : 1,
    /**
     * Repeat the entire queue.
     */
    QUEUE : 2,
    /**
     * When last track ends, play similar tracks in the future if queue is empty.
     */
    AUTOPLAY : 3
}

const repeatModeEmojiStr = (repeatMode) => repeatMode === QueueRepeatMode.AUTOPLAY
  ? ':gear: Autoplay'
  : repeatMode === QueueRepeatMode.QUEUE
    ? ':repeat: Queue'
    : repeatMode === QueueRepeatMode.TRACK
      ? ':repeat_one: Track'
      : ':arrow_forward: Off';

const queueEmbeds = (queue, guild, title) => {
    // Ok, display the queue!
    const currQueue = queue.tracks.toArray();
    const repeatModeStr = repeatModeEmojiStr(queue.repeatMode);
    const usableEmbeds = [];
    const chunkSize = 10;
    for (let i = 0; i < currQueue.length; i += chunkSize) {
      // Cut chunk
      const chunk = currQueue.slice(i, i + chunkSize);
      const embed = new EmbedBuilder()
        .setColor(botColor)
        .setAuthor({
          name: `${ guild.name } ${ title }`,
          iconURL: guild.iconURL({ dynamic: true })
        });
  
      // Resolve string output
      const chunkOutput = chunk.map((e, ind) => queueTrackCb(e, ind + i)).join('\n');
  
      // Construct our embed
      embed
        .setDescription(stripIndents`
              ${music} ** | Now Playing: ** [${escapeMarkdown(queue.currentTrack.title)}](${queue.currentTrack.url})${ typeof queue.repeatMode !== 'undefined' && queue.repeatMode !== null ? `\n${mode} ** | Repeat/Loop Mode: ** ${ repeatModeStr }` : '' }
    
              ${ chunkOutput }
            `)
        // .setImage(chunk[0]?.thumbnail)
        .setFooter({ text: `Page ${ Math.ceil((i + chunkSize) / chunkSize) } of ${
          Math.ceil(currQueue.length / chunkSize)
        // eslint-disable-next-line sonarjs/no-nested-template-literals
        } [${ i + 1 }-${ Math.min(i + chunkSize, currQueue.length) } / ${ currQueue.length }]${ queue.estimatedDuration ? `\nDuration: ${ msToHumanReadableTime(queue.estimatedDuration) }` : '' }` });
  
      // Always push to usable embeds
      usableEmbeds.push(embed);
    }
  
    return usableEmbeds;
};

const queueEmbedResponse = (interaction, queue, title = 'Queue') => {
    const { guild, member } = interaction;
    // Ok, display the queue!
    const usableEmbeds = queueEmbeds(queue, guild, title);
    // Queue empty
    if (usableEmbeds.length === 0){
       interaction.reply({ embeds: [
            new EmbedBuilder()
              .setColor(botColor)
              .setDescription(`${ sad }, Queue is currently empty.`)
          ] });

          try {
            setTimeout(() => {
              interaction.deleteReply()
            }, 1000)
          }catch(error){
            console.log(error);
          }
    }
    // Reply to the interaction with the SINGLE embed
    else if (usableEmbeds.length === 1) interaction.reply({ embeds: usableEmbeds }).catch(() => { /* Void */ });
    // Properly handle pagination for multiple embeds
    else handlePagination(interaction, member, usableEmbeds);
};

const getPaginationComponents = (pageNow, pageTotal, prevCustomId, nextCustomId, disableAll = false) => {
  return [
    new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(prevCustomId)
          .setLabel('Prev')
          .setDisabled(!!(disableAll || pageNow === 1))
          .setEmoji('◀️')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId(nextCustomId)
          .setLabel('Next')
          .setDisabled(!!(disableAll || pageNow === pageTotal))
          .setEmoji('▶️')
          .setStyle(ButtonStyle.Secondary)
      )
  ];
};

const dynamicInteractionReplyFn = (interaction, shouldFollowUpIfReplied = false) => {
  const interactionWasAcknowledged = interaction.deferred || interaction.replied;
  return interactionWasAcknowledged
    ? shouldFollowUpIfReplied
      ? interaction.followUp
      : interaction.editReply
    : interaction.reply;
};

const handlePaginationButtons = (i, componentMember, pageNow, prevCustomId, nextCustomId, usableEmbeds) => {
  // Wrong user
  if (i.user.id !== componentMember.user.id) {
    i.reply({
      embeds: [
        errorEmbed(`You are not allowed to react to this, Request it yourself by using \`/queue\` command`)
      ],
      ephemeral: true
    });
    return false;
  }

  // Prev Button - Check bounds
  else if (
    i.customId === prevCustomId
    && pageNow === 1
  ) {
    i.reply({
      embeds: [
        errorEmbed(`You're on the first page already`)
      ],
      ephemeral: true
    });
    return false;
  }

  // Next - Check bounds
  else if (
    i.customId === nextCustomId
    && pageNow === usableEmbeds.length
  ) {
    i.reply({
      embeds: [
        errorEmbed(`You're already viewing the last page`)
      ],
      ephemeral: true
    });
    return false;
  }

  // Passed checks
  return true;
};

const queueTrackCb = (track, idx) => `${ ++idx }. [${ track.title }](${ track.url }) - \`${ track.duration }\`- ${track.requestedBy}`;

const msToHumanReadableTime = (ms) => {
    const days = Math.floor(ms / 864e5);
    const hours = Math.floor((ms % 864e5) / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
  
    const parts = [];
    if (days > 0) parts.push(`${ days } day${ days === 1 ? '' : 's' }`);
    if (hours > 0) parts.push(`${ hours } hour${ hours === 1 ? '' : 's' }`);
    if (minutes > 0) parts.push(`${ minutes } minute${ minutes === 1 ? '' : 's' }`);
    if (seconds > 0) parts.push(`${ seconds } second${ seconds === 1 ? '' : 's' }`);
  
    if (parts.length === 0) return '0 seconds';
    else if (parts.length === 1) return parts[0];
    else if (parts.length === 2) return `${ parts[0] } and ${ parts[1] }`;
    else {
      const lastPart = parts.pop();
      const formattedParts = parts.join(', ');
      return `${ formattedParts }, and ${ lastPart }`;
    }
};

const errorEmbed = (content) => new EmbedBuilder().setColor(errorColor).setDescription(`${error} ${content}.`)

module.exports = {
    msToHumanReadableTime,
    handlePagination,
    QueueRepeatMode,
    repeatModeEmojiStr,
    queueEmbeds,
    queueEmbedResponse,
    getPaginationComponents,
    dynamicInteractionReplyFn,
    handlePaginationButtons,
    queueTrackCb,
    errorEmbed
}