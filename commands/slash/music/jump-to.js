const { SlashCommandBuilder } = require('discord.js');
const { errorEmbed, successEmbed, requireSessionConditions } = require('../../../helper/utils');
const { useQueue } = require('discord-player');
const { ERROR_MSGE_DELETE_TIMEOUT, BOT_MSGE_DELETE_TIMEOUT } = require('../../../helper/constants');
const { errorLog } = require('../../../configs/logger');

module.exports = {
  category: 'music',
  cooldown: 3,
  aliases: ['jump'],
  data: new SlashCommandBuilder()
    .setName('jump')
    .setDescription("Jump to a specific song without removing other songs.")
    .addIntegerOption(option =>
      option.setName('position')
        .setDescription('The song position to jump to that song.')
        .setRequired(true)
        .setMinValue(2)
        .setMaxValue(999_999)
    ),

  async execute(interaction, client) {

    const jumpToIndex = Number(interaction.options.getInteger('position')) - 1;

    // Check state
    if (!requireSessionConditions(interaction, true)) return;

    try {
      // Check has queue
      const queue = useQueue(interaction.guild.id);
      if (queue.isEmpty()) {
        await interaction.reply({ embeds: [errorEmbed(`Queue is currently empty`)] });
        setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
        return;
      }

      // Check bounds
      const queueSizeZeroOffset = queue.size - 1;
      if (jumpToIndex > queueSizeZeroOffset) {
        await interaction.reply({ embeds: [errorEmbed(`There is nothing at song position ${jumpToIndex + 1}, The highest position is ${queue.size}`)] });
        setTimeout(() => interaction.deleteReply(), ERROR_MSGE_DELETE_TIMEOUT)
        return;
      }

      // Try to jump to new position/queue
      queue.node.jump(jumpToIndex);
      await interaction.reply({ embeds: [successEmbed(`Jumping to **${jumpToIndex + 1}** song`)] });
      setTimeout(() => interaction.deleteReply(), BOT_MSGE_DELETE_TIMEOUT)

    } catch (error) {
      await interaction.reply({
        embeds: [
          errorEmbed(`Something went wrong while executing \`/jump\` command`)
        ],
        ephemeral: true
      });
      errorLog(error)
    }
  },
};