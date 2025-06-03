import discord
from discord.ext import commands
from dotenv import load_dotenv
import os
import asyncio


def CreateBot(botNum):
    intents = discord.Intents.default()
    intents.message_content = True
    intents.guilds = True
    intents.messages = True

    bot = commands.Bot(command_prefix=commands.when_mentioned, intents=intents)

    @bot.event
    async def on_ready():
        prefixPad = ("bot" + botNum).ljust(5)  # adjust width for longest name
        userPad = str(bot.user).ljust(14) #adjust width for longest userName+5
        print(f"[{prefixPad}] Logged in as {userPad} (ID: {bot.user.id})")

    @bot.event
    async def on_message(message):
        if message.author.bot:
            return
        if bot.user in message.mentions:
            await message.channel.send(f"I am {bot.user.name}!")
        await bot.process_commands(message)

    return bot


async def main():
    tokenList = readTokens()
    botsList = initializeBots(tokenList)

    await startAllBots(botsList, tokenList)


#returns array holding each token
def readTokens():
    tokens = []

    load_dotenv()
    for key, token in os.environ.items():
        if key.startswith("TOKEN_") and token:
            tokens.append(token)
    return tokens

#returns array holding each bot
def initializeBots(tokens):
    bots = []
    for i in range(len(tokens)):
        bots.append(CreateBot(str(i)))
    return bots

async def startAllBots(bots, tokens):
    tasks = []
    for bot, token in zip(bots, tokens):
        tasks.append(asyncio.create_task(startBot(bot, token)))
    await asyncio.gather(*tasks)

async def startBot(bot, token):
    try:
        await bot.start(token)
    except Exception as e:
        print(f"[ERROR] Bot {bot.command_prefix} failed to start: {e}")

try:
    asyncio.run(main())
except KeyboardInterrupt:
    print("\n")