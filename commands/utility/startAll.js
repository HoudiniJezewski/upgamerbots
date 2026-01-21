const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('startall')
        .setDescription('Starts all bots'),
	async execute(interaction, { botManager }) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await botManager.startAll();
        await interaction.editReply('All bots have been logged in');
	},
};