const { Client, Events, GatewayIntentBits } = require('discord.js');

class DiscordBot {
  constructor(config) {
    this.name = config.name;
    this.token = config.token;

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ]
    });

    this.registerEvents();
  }

  registerEvents() {
    this.client.on(Events.ClientReady, () => {
        const label = `[${this.name.padEnd(7)}]`;
        const tag = this.client.user.tag.padEnd(15); 
        console.log(`${label} Logged in as ${tag} (ID: ${this.client.user.id})`);
    });

    this.client.on(Events.MessageCreate, async (message) => {
      if (message.author.bot) return;
      if (message.mentions.has(this.client.user)) {
        await message.channel.send(`I am ${this.client.user.username}!`);
      }
    });
  }

  async start() {
    try {
      await this.client.login(this.token);
    } catch (err) {
      console.error(`[ERROR] Bot ${this.name} failed to start:`, err);
    }
  }
}

module.exports = DiscordBot;
