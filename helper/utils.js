const { stripIndents } = require("common-tags");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, escapeMarkdown } = require("discord.js");
const { botColor, errorColor } = require("../configs/config");
const { error, mode, sad, success, disk, cyanDot, arrow, bottomArrow, leftAngleDown, leftt } = require("../configs/emojis");
const { GuildQueuePlayerNode, QueueRepeatMode } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT, DEFAULT_DECIMAL_PRECISION, NS_IN_ONE_MS, NS_IN_ONE_SECOND } = require("./constants");

const handlePagination = async (
  interaction,
  member,
  usableEmbeds,
  activeDurationMs = 60000 * 3,
  shouldFollowUpIfReplied = false
) => {
  let pageNow = 1;
  const prevCustomId = `@page-prev@${member.id}@${Date.now()}`;
  const nextCustomId = `@page-next@${member.id}@${Date.now()}`;

  const initialCtx = {
    embeds: [usableEmbeds[pageNow - 1]],
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
    embeds: [usableEmbeds[pageNow - 1]],
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
    interaction.editReply({
      components: getPaginationComponents(
        pageNow,
        usableEmbeds.length,
        prevCustomId,
        nextCustomId,
        true
      )
    }).catch(() => { /* Void */ });
  });
};

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
        name: `${guild.name} ${title}`,
        iconURL: guild.iconURL({ dynamic: true })
      });

    // Resolve string output
    const chunkOutput = chunk.map((e, ind) => queueTrackCb(e, ind + i)).join('\n');

    // Construct our embed
    embed
      .setDescription(stripIndents`
              ${disk} ** | Now Playing: ** [${escapeMarkdown(queue.currentTrack.title)}](${queue.currentTrack.url})${typeof queue.repeatMode !== 'undefined' && queue.repeatMode !== null ? `\n${mode} ** | Repeat/Loop Mode: ** ${repeatModeStr}` : ''}
    
              ${chunkOutput}
            `)
      // .setImage(chunk[0]?.thumbnail)
      .setFooter({
        text: `Page ${Math.ceil((i + chunkSize) / chunkSize)} of ${Math.ceil(currQueue.length / chunkSize)
          // eslint-disable-next-line sonarjs/no-nested-template-literals
          } [${i + 1}-${Math.min(i + chunkSize, currQueue.length)} / ${currQueue.length}]${queue.estimatedDuration ? `\nDuration: ${msToHumanReadableTime(queue.estimatedDuration)}` : ''}`
      });

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
  if (usableEmbeds.length === 0) {
    interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(botColor)
          .setDescription(`${sad} Queue is currently empty.`)
      ]
    });

    try {
      setTimeout(() => {
        interaction.deleteReply()
      }, BOT_MSGE_DELETE_TIMEOUT)
    } catch (error) {
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

const queueTrackCb = (track, idx) => `${++idx}. [${track.title}](${track.url}) - \`${track.duration}\`- ${track.requestedBy}`;

const msToHumanReadableTime = (ms) => {
  const days = Math.floor(ms / 864e5);
  const hours = Math.floor((ms % 864e5) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  const parts = [];
  if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
  if (seconds > 0) parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);

  if (parts.length === 0) return '0 seconds';
  else if (parts.length === 1) return parts[0];
  else if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  else {
    const lastPart = parts.pop();
    const formattedParts = parts.join(', ');
    return `${formattedParts}, and ${lastPart}`;
  }
};

const errorEmbed = (content) => new EmbedBuilder().setColor(errorColor).setDescription(`${error} ${content}.`)

const successEmbed = (content) => new EmbedBuilder().setColor(botColor).setDescription(`${success} ${content}.`)


const nowPlayingEmbed = (queue, includeSessionDetails = true) => {
  const { currentTrack } = queue;
  const trackDescriptionOutputStr = currentTrack.description
    ? `\n\`\`\`\n${currentTrack.description}\`\`\`\n`
    : '';

  const ts = queue.node.getTimestamp();
  const durationOut = ts === 'Forever' ? 'Live' : currentTrack.duration;

  const guildPlayerQueue = new GuildQueuePlayerNode(queue);

  const sessionDetails = includeSessionDetails
    ? `\n${trackDescriptionOutputStr}\n${guildPlayerQueue.createProgressBar()}`
    : '';

  const npEmbed = new EmbedBuilder()
    .setColor(botColor)
    .setTitle(currentTrack.title)
    .setURL(currentTrack.url)
    .setImage(currentTrack.thumbnail)
    .addFields(
      {
        name: 'Details',
        value: stripIndents`
      👑 **Author:** ${currentTrack.author}
      🚩 **Length:** ${durationOut}
      📖 **Views:** ${currentTrack.views.toLocaleString()}${sessionDetails}
    `,
        inline: true
      }
    );

  if (includeSessionDetails) {
    npEmbed.addFields({
      name: 'Repeat/Loop Mode',
      value: repeatModeEmojiStr(queue.repeatMode),
      inline: false
    });
    npEmbed.setFooter({ text: `Requested by: ${currentTrack.requestedBy.username}` });
    npEmbed.setTimestamp(queue.metadata.timestamp);
  }

  return npEmbed;
};

const startedPlayingEmbed = (queue, track, client) => {
  return new EmbedBuilder()
    .setColor(botColor)
    .setAuthor({
      iconURL: `https://media.discordapp.net/attachments/1253855563985584139/1253855637956329553/music.gif?ex=66775f8f&is=66760e0f&hm=4bb98ed7d4826424d9fda456900d08d6bfb27f7b295b86945dd20c733dab10cf&=&width=250&height=197`,
      name: `Started Playing ${bottomArrow}`
    })
    .setTitle(`${disk} ${track.title}`)
    .setURL(track.url)
    .setThumbnail(track.thumbnail)
    .addFields(
      { name: `${cyanDot} Duration`, value: `${arrow} ${track.duration}`, inline: true },
      { name: `${cyanDot} Artist`, value: `${arrow} ${track.author}`, inline: true },
      { name: `${cyanDot} Repeat-mode`, value: `${arrow} ${ repeatModeEmojiStr(queue.repeatMode)}`, inline: true },
    )
    // .addFields(
    //   { name: `${cyanDot} Volume`, value: `┕> ${track.duration}`, inline: true },
    //   { name: `${cyanDot} Repeat Mode`, value: `┕> ${track.author}`, inline: true },
    //   { name: `${cyanDot} Autoplay`, value: `┕> ${queue.tracks.toArray().length} songs`, inline: true },
    // )
    .addFields(
      { name: `${cyanDot} Song link`, value: `${arrow} [Click here](${track.url})` }
    )
    .setFooter({
      iconURL: client.user.displayAvatarURL(),
      text: `Requested by - ${track.requestedBy.username}.`
    })
  // .setDescription(`[${ escapeMarkdown(track.title) }](${ track.url }) - \`${track.duration}\` By ${track.requestedBy}.`)

}

const InteractionType = {
  MessageComponent: 0,
  ApplicationCommand: 1,
  ApplicationCommandAutocomplete: 3,
  ModalSubmit: 4
}

const getRuntime = (hrtime, decimalPrecision = DEFAULT_DECIMAL_PRECISION) => {
  // Converting
  const inNS = process.hrtime.bigint() - hrtime;
  const nsNumber = Number(inNS);
  const inMS = (nsNumber / NS_IN_ONE_MS).toFixed(decimalPrecision);
  const InSeconds = (nsNumber / NS_IN_ONE_SECOND).toFixed(decimalPrecision);

  // Return the conversions
  return {
    seconds: InSeconds,
    ms: inMS,
    ns: inNS
  };
};

const titleCase = (str) => {
  if (typeof str !== 'string') throw new TypeError('Expected type: String');
  str = str.toLowerCase().split(' ');
  for (let i = 0; i < str.length; i++) str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
  return str.join(' ');
};

const ApplicationCommandType = (type) => {
  const optionTypes = ['Sub command', 'Sub command group', 'String', 'Integer', 'Boolean', 'User', 'Channel', 'Role', 'Mentionable', 'Number', 'Attachment']
  return optionTypes[type]
}

const getChoices = (type, choices=false, min=false, max=false) => {
  if(choices){
    return choices.map(choice => choice.name).join(", ")
  }else{
    const optionTypes = ['Select any sub command', 'Select group of sub command', 'Enter text', 'Enter numbers', 'Select true or false', 'Select or mention any user', 'Select or type channel', 'Mention role', 'Mention user, role, channel etc..', 'Enter number', 'Attach external file']
    let string = optionTypes[type]
    if(min && max) [4,9].includes(type+1) ? string+= ` between ${min} and ${max}` : string+=` minimum ${min} and maximum ${max} options.`
    return string
  }
}

getCommandOptions = (optionsArray) => {
  const title = { name: `${cyanDot} Options`, value: `${leftt} This command also supports options as mention below.`, inline: false}
  const fields = optionsArray?.map(item => {
    console.log(item);
    return {
      name: `${leftAngleDown} ${titleCase(item.name)}`,
      value: `${arrow} ${ApplicationCommandType(item.type-1)} Choices -> ${getChoices(item.type-1, item?.choices ? item.choices : false, item?.min_value ? item.min_value : false, item?.max_value ? item.max_value : false)}`
    }
  })
  return [title, ...fields]
}

module.exports = {
  InteractionType,
  msToHumanReadableTime,
  handlePagination,
  repeatModeEmojiStr,
  queueEmbeds,
  queueEmbedResponse,
  getPaginationComponents,
  dynamicInteractionReplyFn,
  handlePaginationButtons,
  queueTrackCb,
  errorEmbed,
  successEmbed,
  nowPlayingEmbed,
  getRuntime,
  startedPlayingEmbed,
  titleCase,
  ApplicationCommandType,
  getChoices,
  getCommandOptions
}

