require('dotenv').config();
const botDefs = require("./botConfig");

function loadConfigs() {
  return Object.values(botDefs)
  .map((bot) => {
    const token = process.env[bot.tokenEnv];

    if (!token) {
      throw new Error(`Missing token for bot: ${bot.name}`);
    }

    return {
      name: bot.name,
      model: bot.model,
      token,
    };
  });
}

module.exports = loadConfigs;
