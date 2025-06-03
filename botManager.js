const DiscordBot = require('./bot');

// Handles the management of multiple Discord bots
class BotManager {
    /**
     * Initializes the BotManager with an array of discord bots.
     * Each config must contain (name, token).
     * @param {Array} botConfigs - Pair of (name, token).
     */
  constructor(botConfigs) {
    //creates each bot instance and returns and array into this.bots
    this.bots = botConfigs.map(config => new DiscordBot(config));
  }

  // Starts all bots
  async startAll() {
    const tasks = this.bots.map(bot => bot.start());
    await Promise.all(tasks);
  }
}

module.exports = BotManager;