const UpBot = require('./main/upBot');

(async () => {
  //const manager = new BotManager(loadConfigs());
  //await manager.startAll();

  const upBot = new UpBot();
  await upBot.start();
})();