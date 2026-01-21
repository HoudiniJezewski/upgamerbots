const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('killall')
        .setDescription('Logs out all bots'),

	async execute(interaction, { botManager }) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        await botManager.killAll();
        await interaction.editReply('All bots have been logged out');
	},
};