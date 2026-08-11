const { Collection } = require('discord.js');
const getCommandModules = require('./getCommandModules.js');

// Single pass over every .js file under commands/ 
module.exports = (client) => {
  client.components = new Collection(); // customId -> handler with handleSubmit()
  client.reactionWatchers = []; // array of { matches, onAdd, onRemove }

  for (const command of getCommandModules()) {
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    }

    for (const [customId, handler] of Object.entries(command.components ?? {})) {
      client.components.set(customId, handler);
    }

    client.reactionWatchers.push(...(command.reactionWatchers ?? []));
  }
};