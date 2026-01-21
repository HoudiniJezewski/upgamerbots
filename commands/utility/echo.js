const { SlashCommandBuilder, MessageFlags } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('prints output')
        .addStringOption(option => option
            .setName('name')
            .setDescription('name')
            .setRequired(true)
            .addChoices(
                { name: 'Alex',     value: 'alex'   },
                { name: 'Andy',     value: 'andy'   },
                { name: 'Bidoof',   value: 'bidoof' },
                { name: 'Brenden',  value: 'brenden'},
                { name: 'Deelawn',  value: 'deelawn'},
                { name: 'Ervin',    value: 'ervin'  },
                { name: 'Houdini',  value: 'houdini'},
                { name: 'John',     value: 'john'   },
                { name: 'Matthew',  value: 'matthew'},
                { name: 'Miguel',   value: 'miguel' },
                { name: 'Raymond',  value: 'raymond'},
                { name: 'Shane',    value: 'shane'  },
            ))
        .addStringOption(option => option
            .setName('message')
            .setDescription('message')
            .setRequired(true)),

	async execute(interaction, { botManager }) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const botName = interaction.options.getString('name');
        const message = interaction.options.getString('message');

        const bot = botManager.bots.find(b => b.name.toLowerCase() === botName.toLowerCase());

        if (!bot) {
            await interaction.editReply({
                content: `No bot found with the name "${botName}"`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        try{
            await bot.sendMessage(message, interaction.channelId);
            await interaction.deleteReply();
        } catch (error) {
            console.error(`[ERROR] Failed to send message with ${botName}`, error)
            await interaction.editReply({
                content: `Failed to send message with ${botName}`,
                flags: MessageFlags.Ephemeral
            });
        }
	},
};