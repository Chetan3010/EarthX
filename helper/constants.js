require('dotenv').config

module.exports = {
     OWNERID: process.env.ownerId,
     feedbackGuildId: process.env.feedbackGuildId,
     feedbackChannelId: process.env.feedbackChannelId,

     NS_IN_ONE_MS: 1000000,
     NS_IN_ONE_SECOND: 1e9,
     MS_IN_ONE_SECOND: 1000,
     MS_IN_ONE_MINUTE: 60000,
     MS_IN_ONE_HOUR: 3600000,
     MS_IN_ONE_DAY: 864e5,

     SECONDS_IN_ONE_MINUTE: 60,
     MINUTES_IN_ONE_HOUR: 60,
     HOURS_IN_ONE_DAY: 24,


     ERROR_MSGE_DELETE_TIMEOUT: 30000,
     BOT_MSGE_DELETE_TIMEOUT: 60000,

     EMBED_DESCRIPTION_MAX_LENGTH: 4096,

     DEFAULT_DECIMAL_PRECISION: 2,

     BYTES_IN_KIB: 1024,
     BYTES_IN_MIB: 1048576,
     BYTES_IN_GIB: 1048576 * 1024,
}