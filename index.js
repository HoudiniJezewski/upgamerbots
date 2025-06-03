const loadConfigs = require('./utils/loadConfigs');
const BotManager = require('./botManager');

(async () => {
  const manager = new BotManager(loadConfigs());
  await manager.startAll();
})();