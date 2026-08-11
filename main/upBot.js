const { Client, Events, GatewayIntentBits, Partials, Collection, MessageFlags } = require("discord.js");
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
                GatewayIntentBits.GuildMessageReactions,
            ],
            // needed for any caches reactions
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
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
            if (interaction.isChatInputCommand()) {
                await this.#handleSlashCommands(interaction);
            } else if (interaction.isModalSubmit()) {
                await this.#handleModalSubmit(interaction);
            }
        });

        this.client.on(Events.MessageReactionAdd, async (reaction, user) => {
            await this.#handleReactionChange(reaction, user, true);
        });

        this.client.on(Events.MessageReactionRemove, async (reaction, user) => {
            await this.#handleReactionChange(reaction, user, false);
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

            try {
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

    // Generic modal submit dispatch: looks up a handler by customId in
    //  the registry loadCommands() built
    async #handleModalSubmit(interaction) {
        const handler = interaction.client.components.get(interaction.customId);

        if (!handler) {
            console.error(`No component handler for customId ${interaction.customId} was found.`);
            return;
        }

        try {
            await handler.handleSubmit(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: 'There was an error processing that submission.',
                    flags: MessageFlags.Ephemeral,
                });
            } else {
                await interaction.reply({
                    content: 'There was an error processing that submission.',
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }

    // Generic reaction dispatch: asks every registered watcher whether this
    // reaction concerns it, and calls onAdd/onRemove on whichever one says yes.
    async #handleReactionChange(reaction, user, added) {
        if (user.bot) return;

        // @ts-ignore
        for (const watcher of this.client.reactionWatchers) {
            try {
                if (!(await watcher.matches(reaction))) continue;
                if (added) {
                    await watcher.onAdd(reaction, user);
                } else {
                    await watcher.onRemove(reaction, user);
                }
            } catch (error) {
                console.error(`[${this.name}] Reaction watcher failed:`, error);
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