const { stripIndents } = require("common-tags");
const { joinvc } = require("../configs/emojis");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType, escapeMarkdown, StringSelectMenuBuilder } = require("discord.js");
const { botColor, errorColor } = require("../configs/config");
const { error, mode, sad, success, disk, cyanDot, arrow, bottomArrow, leftAngleDown, leftt, cyanVertical, greyline, cyanLine, separator } = require("../configs/emojis");
const { GuildQueuePlayerNode, QueueRepeatMode, usePlayer, useQueue, useMainPlayer } = require("discord-player");
const { BOT_MSGE_DELETE_TIMEOUT, DEFAULT_DECIMAL_PRECISION, NS_IN_ONE_MS, NS_IN_ONE_SECOND } = require("./constants");

const requireSessionConditions = (
    interactionOrMessage,
    requireVoiceSession = false,
    useInitializeSessionConditions = false,
    requireDJRole = false // Explicit set to false for public commands not available as of now
) => {
    // Determine if it's an interaction or a message
    const isInteraction = interactionOrMessage.isCommand?.(); 
    const guild = isInteraction ? interactionOrMessage.guild : interactionOrMessage.member.guild;
    const member = isInteraction ? interactionOrMessage.member : interactionOrMessage.member;

    // Return early
    // if (!requireMusicChannel(interaction)) return false;
    // if (requireDJRole && !requireDJ(interaction)) return false;

    // Check voice channel requirement
    const channel = member.voice?.channel;

    if (!channel) {
        interactionOrMessage.reply?.({
            embeds: [
                new EmbedBuilder()
                    .setColor(errorColor)
                    .setDescription(`${joinvc} Please join/connect to a voice channel first.`)
            ],
            ephemeral: true
        });
        return false;
    }

    const queue = useQueue(guild.id);
    if (queue && queue.channel.id !== channel.id) {
        interactionOrMessage.reply?.({
            embeds: [
                errorEmbed(`I'm playing in <#${queue.channel.id}>`)
            ],
            ephemeral: true
        });
        return false;
    }

    if (
        useInitializeSessionConditions === true
        && requireInitializeSessionConditionsUnified(interactionOrMessage) !== true
    ) return false;

    else if (
        requireVoiceSession === true
        && !usePlayer(guild.id)?.queue
    ) {
        interactionOrMessage.reply?.({
            embeds: [
                errorEmbed(`No music is currently being played - use \`/play\` command to play something first.`)
            ],
            ephemeral: true
        });
        return false;
    }

    return true;
};

const requireInitializeSessionConditionsUnified = (interactionOrMessage) => {
    const isInteraction = interactionOrMessage.isCommand?.();
    const member = isInteraction ? interactionOrMessage.member : interactionOrMessage.member;
    const channel = member.voice?.channel;

    // Can't see channel
    if (!channel.viewable) {
        interactionOrMessage.reply?.({
            embeds: [
                errorEmbed(`I don't have permission to see your voice channel - maybe I don't have permissions or something`)
            ],
            ephemeral: true
        });
        return false;
    }

    // Join channel
    if (!channel.joinable) {
        interactionOrMessage.reply?.({
            embeds: [
                errorEmbed(`I don't have permission to join your voice channel - maybe I don't have permissions or something`)
            ],
            ephemeral: true
        });
        return false;
    }

    // Channel is full
    if (
        channel.full
        && !channel.members.some((m) => m.id === interactionOrMessage.client.user.id)
    ) {
        interactionOrMessage.reply?.({
            embeds: [
                errorEmbed(`Your voice channel is currently full.`)
            ],
            ephemeral: true
        });
        return false;
    }

    return true;
};

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
            : ':no_entry: Off';

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
            .setFooter({
                text: `Page ${Math.ceil((i + chunkSize) / chunkSize)} of ${Math.ceil(currQueue.length / chunkSize)
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

const secondsToHumanReadableTime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const parts = [];
    if (days > 0) parts.push(`${days} day${days === 1 ? '' : 's'}`);
    if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
    if (minutes > 0) parts.push(`${minutes} minute${minutes === 1 ? '' : 's'}`);
    if (secs > 0) parts.push(`${secs} second${secs === 1 ? '' : 's'}`);

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

const nowPlayingEmbed = (interaction, client, queue) => {
    const { currentTrack } = queue;

    const np = new EmbedBuilder()
        .setColor(botColor)
        .setAuthor({
            name: `Info about current song ${bottomArrow}`,
            iconURL: client.user.displayAvatarURL()
        })
        .setTitle(`**${currentTrack.source === 'youtube' ? currentTrack.cleanTitle || currentTrack.title : currentTrack.title}**`)
        .setURL(currentTrack.url)
        // .setThumbnail(currentTrack.thumbnail)
        .setImage(currentTrack.thumbnail)
        .addFields(
            { name: `${leftAngleDown} Duration`, value: `${arrow} ${currentTrack.duration === '0:00' ? 'Live' : currentTrack.duration}`, inline: true },
            { name: `${leftAngleDown} Artists`, value: `${arrow} ${currentTrack.author}`, inline: true },
            { name: `${leftAngleDown} Source`, value: `${arrow} ${titleCase(currentTrack.source)}`, inline: true },
        )
        .addFields(
            { name: `${leftAngleDown} Repeat mode`, value: `${arrow} ${repeatModeEmojiStr(queue.repeatMode)}`, inline: true },
            { name: `${leftAngleDown} Volume`, value: `${arrow} ${queue.options.volume} %`, inline: true },
            { name: `${leftAngleDown} Song link`, value: `${arrow} [Click here](${currentTrack.url})`, inline: true },
        )
        .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `Requested by ${interaction.user.username}`
        })
        .setTimestamp()

    return np
}

const saveSongEmbed = (interaction, client, queue) => {
    const { currentTrack } = queue;

    const np = new EmbedBuilder()
        .setColor(botColor)
        .setAuthor({
            name: `Saved song ${bottomArrow}`,
            iconURL: client.user.displayAvatarURL()
        })
        .setTitle(`**${currentTrack.source === 'youtube' ? currentTrack.cleanTitle || currentTrack.title : currentTrack.title}**`)
        .setURL(currentTrack.url)
        .setImage(currentTrack.thumbnail)
        .addFields(
            { name: `${leftAngleDown} Artists`, value: `${arrow} ${currentTrack.author}`, inline: true },
            { name: `${leftAngleDown} Duration`, value: `${arrow} ${currentTrack.duration === '0:00' ? 'Live' : currentTrack.duration}`, inline: true },
            { name: `${leftAngleDown} Source`, value: `${arrow} ${titleCase(currentTrack.source)}`, inline: true },
        )
        .addFields(
            { name: `${leftAngleDown} Uploaded at`, value: `${arrow} ${currentTrack.metadata?.uploadedAt || new Date(currentTrack.metadata?.source?.releaseDate.isoString).toLocaleDateString('en-US') || 'NA'}`, inline: true },
            { name: `${leftAngleDown} Likes`, value: `${arrow} ${currentTrack.raw?.likes || currentTrack.metadata.bridge?.likes || 'NA'}`, inline: true },
            { name: `${leftAngleDown} Song link`, value: `${arrow} [Click here](${currentTrack.url})`, inline: true },
        )
        .setFooter({
            iconURL: interaction.user.displayAvatarURL(),
            text: `Requested by ${interaction.user.username}`
        })
        .setTimestamp()

    return np
}

// const updatePlayerStart = (queue, client) => {
//   const node = queue.node
//   const { currentTrack, tracks } = queue
//   const nextTrack = tracks.toArray()[0]
// }

const getProgressBar = node => {
    return node.createProgressBar({
        indicator: `:large_orange_diamond:`,
        rightChar: greyline,
        leftChar: cyanLine,
        // timecodes: true,
        separator: cyanVertical,
        length: 10
    })
}

const getSuggestedSongs = async (track) => {
    const player = useMainPlayer()
    try {
        const recommendations = await player.search(`${track.title} ${track.author}`, {
            fallbackSearchEngine: 'auto'
        });

        return recommendations.tracks.map(recommendedTrack => ({
            title: recommendedTrack.title,
            url: recommendedTrack.url,
            author: recommendedTrack.author
        }));

    } catch (error) {
        console.error('Error getting song recommendations:', error);
        return []; 
    }
}

const startedPlayingMenu = async (queue, track) => {
    const { tracks } = queue
    const trackForSuggestions = tracks.toArray().pop() || track
    const suggestedSongs = await getSuggestedSongs(trackForSuggestions)

    // Early return if no suggestions or less than 1 song
    if (!suggestedSongs || suggestedSongs.length < 1) {
        return null; // Return null instead of false to clearly indicate no menu should be created
    }

    // Create options array from valid suggestions
    const options = suggestedSongs
        .slice(0, 20)
        .map((song, index) => ({
            label: `${index + 1}. ${song.title}`.slice(0, 100),
            description: `By ${song.author}`.slice(0, 100),
            value: song.url
        }))
        .filter(option => option.label && option.value); // Ensure all options have required properties

    // Return null if no valid options after filtering
    if (options.length < 1) {
        return null;
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('@add_suggested_song')
        .setPlaceholder('Add a suggested song to the queue')
        .addOptions(options);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    return row;
}

const startedPlayingEmbed = (queue, track, client) => {
    const node = queue.node
    const { tracks } = queue
    const nextTrack = tracks.toArray()[0]

    return new EmbedBuilder()
        .setColor(botColor)
        .setAuthor({
            iconURL: `https://media.discordapp.net/attachments/1253855563985584139/1253855637956329553/music.gif?ex=66775f8f&is=66760e0f&hm=4bb98ed7d4826424d9fda456900d08d6bfb27f7b295b86945dd20c733dab10cf&=&width=250&height=197`,
            name: `Now Playing ${bottomArrow}`
        })
        .setTitle(`${disk} ${track.title}`)
        .setURL(track.url)
        // .setThumbnail(track.thumbnail)
        .addFields(
            { name: `${leftAngleDown} Duration`, value: `${arrow} ${track.duration === '0:00' ? 'Live' : track.duration}`, inline: true },
            { name: `${leftAngleDown} Artists`, value: `${arrow} ${track.author}`, inline: true },
            { name: `${leftAngleDown} Repeat mode`, value: `${arrow} ${repeatModeEmojiStr(queue.repeatMode)}`, inline: true },
            { name: `${leftAngleDown} Next song`, value: `${arrow} ${nextTrack ? `[${nextTrack.cleanTitle}](${nextTrack.url})` : 'No more songs in the queue.'}`, inline: false }
        )
        // .addFields(
        //   { name: `${cyanDot} Next song`, value: `┕> ${track.author}`, inline: true },
        //   { name: `${cyanDot} Volume`, value: `┕> ${queue.volume}`, inline: true },
        //   { name: `${cyanDot} Autoplay`, value: `┕> ${queue.tracks.toArray().length} songs`, inline: true },
        // )
        // .addFields(
        //   { name: `${leftAngleDown} Song link`, value: `${arrow} [Click here](${track.url})` }
        // )
        // .addFields(
        //   { name: `${cyanDot} Progress ${bottomArrow}`, value: getProgressBar(node), inline: false }
        // )
        .setFooter({
            iconURL: client.user.displayAvatarURL(),
            text: `Requested by ${track.requestedBy.username}.`
        })

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

const getChoices = (type, choices = false, min = false, max = false) => {
    if (choices) {
        return choices.map(choice => choice.name).join(", ")
    } else {
        const optionTypes = ['Select any sub command', 'Select group of sub command', 'Enter text', 'Enter numbers', 'Select true or false', 'Select or mention any user', 'Select or type channel', 'Mention role', 'Mention user, role, channel etc..', 'Enter number', 'Attach external file']
        let string = optionTypes[type]
        if (min && max) [4, 9].includes(type + 1) ? string += ` between ${min} and ${max}` : string += ` minimum ${min} and maximum ${max} options.`
        return string
    }
}

getCommandOptions = (optionsArray) => {
    const title = { name: `${leftAngleDown} Options`, value: `${leftt} This command also supports options as mention below.`, inline: false }
    const size = optionsArray.length
    const fields = optionsArray?.map((item, index) => {
        return {
            name: `${leftt} ${titleCase(item.name)}`,
            value: `${index === size - 1 ? arrow : leftt} ${ApplicationCommandType(item.type - 1)} Choices -> ${getChoices(item.type - 1, item?.choices ? item.choices : false, item?.min_value ? item.min_value : false, item?.max_value ? item.max_value : false)}`
        }
    })
    return [title, ...fields]
}

module.exports = {
    requireSessionConditions,
    InteractionType,
    msToHumanReadableTime,
    secondsToHumanReadableTime,
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
    startedPlayingMenu,
    titleCase,
    ApplicationCommandType,
    getChoices,
    saveSongEmbed,
    getCommandOptions,
    getProgressBar
}

