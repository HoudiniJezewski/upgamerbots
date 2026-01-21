const getCommandModules = require('./getCommandModules.js');

module.exports = (client) => {
  for (const command of getCommandModules()) {
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }
  }
};