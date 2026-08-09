//node --env-file=.envDeploy scripts/deployCommands.js
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

// @ts-ignore
const getCommandModules = require('../utility/getCommandModules.js');

const commands = getCommandModules()
  .filter(cmd => cmd.data)
  .map(cmd => cmd.data.toJSON());


const { TOKEN_UPBOT, CLIENT_ID, GUILD_ID } = process.env
const rest = new REST({ version: '10' }).setToken(TOKEN_UPBOT);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });

		// @ts-ignore
		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		console.error(error);
	}
})();
