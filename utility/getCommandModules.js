const fs = require('fs');
const path = require('path');

module.exports = () => {
  const commands = [];
  const foldersPath = path.join(__dirname, '..', 'commands');

  for (const folder of fs.readdirSync(foldersPath)) {
    const folderPath = path.join(foldersPath, folder);
    if (!fs.statSync(folderPath).isDirectory()) continue;

    for (const file of fs.readdirSync(folderPath).filter(f => f.endsWith('.js'))) {
      const filePath = path.join(folderPath, file);
      const command = require(filePath);
      commands.push(command);
    }
  }

  return commands;
};