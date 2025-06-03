require('dotenv').config();

function loadConfigs() {
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith('TOKEN_') && process.env[key])
    .map(([key, token]) => {
      const name = key.replace('TOKEN_', '');
      return { name, token };
    });
}

module.exports = loadConfigs;