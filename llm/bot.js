const { Client, Events, GatewayIntentBits, Collection, ThreadAutoArchiveDuration} = require("discord.js");
const RequestScheduler = require("./requestScheduler");
const { HistoryQueue } = require('./queues');
const OllamaClient = require("./ollamaClient");

class DiscordBot {
  constructor(config) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.name = config.name;
    this.token = config.token;
    this.model = config.model;

    this.ollamaClient = new OllamaClient(this.model);
    this.botQueue = new RequestScheduler();
    this.idleTimeout = null; // used for making bots appear offline after a delay

    this.loadingEmote = '<a:typingWhite:1462757731730722816>';
    this.botReplyOdds = 0.018; // 20% chance that at least one bot replies

    this.registerEvents();
  }

  registerEvents() {
    this.client.once(Events.ClientReady, () => {
      this.#handleFirstTimeLogin();
    });

    this.client.on(Events.MessageCreate, async (message) => {
      this.#handleMessage(message);
    });
  }

  async start() {
    try {
      if(!this.client.isReady()) {
        await this.client.login(this.token);
      } else {
        console.log(`[INFO] ${this.name} already logged in`);
      }
    } catch (error) {
      console.error(`[ERROR] Bot ${this.name} failed to start:`, error);
    }
  }

  async logout() {
    await this.client.destroy()
    console.log(`[INFO] ${this.name} logged out`);
  }

  async #handleMessage(message) {
    //RETURN CHECKS
    const skipGuards = Math.random() < this.botReplyOdds; 

    if (!skipGuards) {
      if (message.author.bot) return;
      if (!message.mentions.has(this.client.user)) return; // only reply if bot is @ed
    }

    //RUN IMMEDIATELYS
    this.scheduleStatus(300000, "invisible"); // bot will appear offline after 5 minutes
    await message.channel.sendTyping();
    const placeholderMessage = await message.channel.send(
      `${this.loadingEmote}   **${this.client.user.username}** is typing`
    );

    //QUEUED OPERATIONS
    // We queue bot history fetches behind message generation so
    // any newly @ed bots dont fetch a loading message from the current bot
    await HistoryQueue.enqueue(async () => {
      const messageHistory = await formatChannelMessageHistory(
        message.channel,
        message,
        this.client.user.id,
        20);

      const prompt = constructPrompt(messageHistory, this.client.user.username)
      console.log(prompt);

      try {
        const response = await this.ollamaClient.generateResponse(prompt);
        await placeholderMessage.edit(response.slice(0,2000));
      } catch (error) {
        console.error(error);
      }
    });
  }

  async #handleFirstTimeLogin() {
    const label = `[${this.name.padEnd(7)}]`;
    const tag = this.client.user.tag.padEnd(15);
    console.log(`${label} Logged in as ${tag} (ID: ${this.client.user.id})`);
    this.client.user.setStatus('invisible');
  }

  // set a delayed status change
  scheduleStatus(delayMs = 300000, status = "invisible") {
    this.client.user.setStatus('online');

    if(this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }

    this.idleTimeout = setTimeout(() => {

      // @ts-ignore
      this.client.user.setStatus(status);
      this.idleTimeout = null;
    }, delayMs);
  }

  //TODO: add message loading -> delay -> edit symbol
  async sendMessage(message, channelId) {
    this.scheduleStatus(300000, "idle");
    
    const channel = await this.client.channels.fetch(channelId);
    
    if(!channel.isSendable()) return;

    const placeholderMessage = await channel.send(
      `${this.loadingEmote}   **${this.client.user.username}** is typing`
    );

    // 2 second delay to make it look like the bot is generating
    await new Promise(resolve => setTimeout(resolve, 2000));

    await placeholderMessage.edit({ content: message });
  }
}

//TODO: clean up time
async function formatChannelMessageHistory(channel, targetMsg, stopID, messagelimit) {
  const messagesAround = await channel.messages.fetch({
    limit: messagelimit,
    around: targetMsg.id,
  });

  // Remove messages that are after the target message
  const history = new Collection();
  messagesAround.forEach(msg => {
    if (msg.createdTimestamp <= targetMsg.createdTimestamp) {
      history.set(msg.id, msg);
    }
  });


  //formatting
  const lines = [];
  for (const message of history.values()) {
    //stop on last message from this bot
    if(message.author.id == stopID) break;

    const authorType = message.author.bot ? "IMPOSTER" : "user";//change these roles to affect responses
    const authorName = message.member?.displayName ?? message.author.username;

    //replace @s with plaintext name for bot context
    //TODO REMOVE @ if it is at the start of the string
    let content = message.content.replace(/<@!?(\d+)>/g, (match, userId) => {
      const member = message.guild?.members.cache.get(userId);
      return member ? member.displayName: match;
    });

    lines.unshift(`${authorName}: ${content}`);
  }

  return lines.join("\n");
}

//TODO: change format to mirror training
function constructPrompt(messageHistory, botName) {
  return [
  "### Conversation Transcript",
  messageHistory,
  "",
  "### Your Task",
  `Respond as the imposter ${botName} to the latest message.`
  ].join("\n");
}

module.exports = DiscordBot;