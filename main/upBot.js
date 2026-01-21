const { Client, Events, GatewayIntentBits, Collection, MessageFlags } = require("discord.js");
const loadCommands = require('../utility/loadCommands');
const BotManager = require("../llm/botManager");
const loadConfigs = require("../config/loadConfigs");
require('dotenv').config();


class UpBot {
    constructor() {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });

        // @ts-ignore
        this.client.commands = new Collection(); // needed for loading commands

        this.token = process.env.TOKEN_UPBOT
        this.botManager = new BotManager(loadConfigs());

        this.name = "UpBot";
    }

    registerEvents() {
        this.client.once(Events.ClientReady, () => {
            this.#handleLogin();
        });

        this.client.on(Events.MessageCreate, async (message) => {
            await this.#handleMessage(message);
        });

        this.client.addListener(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isChatInputCommand) return;
            await this.#handleSlashCommands(interaction);
        });  
    }

    async start() {
        try {
            this.registerEvents();

            loadCommands(this.client);

            await this.client.login(this.token);

            await this.botManager.startAll();
        } catch (error) {
            console.error(`[ERROR] Bot ${this.name} failed to start:`, error);
        }
    } 

    async #handleSlashCommands(interaction) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
		        return;
            }

            const botCommands = new Set(["echo", "killall", "startall"]);

            try {
                if (botCommands.has(interaction.commandName))
                    await command.execute(interaction, { botManager: this.botManager });
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral,
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error while executing this command!',
                        flags: MessageFlags.Ephemeral,
                    });
                }
            }
    }

    #handleLogin() {
        const label = `[${this.name.padEnd(7)}]`;
        const tag = this.client.user.tag.padEnd(15);
        console.log(`${label} Logged in as ${tag} (ID: ${this.client.user.id})`);
        this.client.user.setStatus('online');
    }

    //TODO add alternate spelling
    async #handleMessage(message) {
        if(message.author.bot) return;
            if(message.content == "whats upbot")
                await message.reply({content: "Not much! what's up with you?"});
    }
}

module.exports = UpBot;