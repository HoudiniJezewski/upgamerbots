const { ChannelType, MessageFlags } = require("discord.js");
const config = require("./config");
const store = require("./store");

function buildPostContent({ medium, theme, time, deadline }) {
  return [
    `# __NEW CREATIVE CALL ${deadline}__`,
    `Creative Call: **${medium}**`,
    `Theme: **${theme}**`,
    `Time: **${time}**`,
    `<@&${config.PING_ROLE_ID}>`,
  ].join("\n");
}

// 1) get data from user modal submission
// 2) bot must send a reply by discord spec
// 3) make the post
// 4) add reaction to post
// 5) make private thread
// 6) update the active cc on discord
// 7) delete the bots reply
async function handleSubmit(interaction) {
  const medium   = interaction.fields.getTextInputValue("medium");
  const theme    = interaction.fields.getTextInputValue("theme");
  const time     = interaction.fields.getTextInputValue("time");
  const deadline = interaction.fields.getTextInputValue("deadline");

  await interaction.deferReply({ flags: MessageFlags.Ephemeral }); // bot interaction is required

  // grab the static channel from our config then build and send the post
  const channel = await interaction.client.channels.fetch(config.CHANNEL_ID);
  const post = await channel.send({
    content: buildPostContent({ medium, theme, time, deadline }),
  });
  await post.react(config.REACTION_EMOTE);

  // private thread creation
  const thread = await channel.threads.create({
    name: `${medium} - ${theme}`,
    type: ChannelType.PrivateThread,
    autoArchiveDuration: config.THREAD_AUTO_ARCHIVE_MINUTES,
    reason: `Creative call opened by ${interaction.user.tag}`,
  });

  // overwrites recent active creative call since only one cc should be joinable at a time
  // the current cc is stored locally in /state/creativeCallState.json
  // any new post must update this cache to keep an active state
  store.setActive({ messageId: post.id, threadId: thread.id, channelId: channel.id });

  // delete bot reply after 3 seconds
  await interaction.editReply(`Creative call posted in <#${channel.id}>.`);
  setTimeout(() => {
    interaction.deleteReply().catch(() => {});
  }, 3000);

}

module.exports = { handleSubmit };