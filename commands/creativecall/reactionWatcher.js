const config = require("./config");
const store = require("./store");

// Custom emoji match by ID config can be just the raw id or "name:id"
// Unicode emoji match by name directly.
function matchesConfiguredEmoji(emoji) {
  const configured = config.REACTION_EMOTE;
  if (emoji.id) {
    const configuredId = configured.includes(":") ? configured.split(":")[1] : configured;
    return emoji.id === configuredId;
  }
  return emoji.name === configured;
}


// matches(reaction): does this reaction event concern this feature?
// onAdd/onRemove(reaction, user): react to a matched add/remove event.
module.exports = {
  async matches(reaction) {
    const active = store.getActive();
    if (!active) return false;

    // Partial reactions/messages
    if (reaction.partial) await reaction.fetch();
    if (reaction.message.partial) await reaction.message.fetch();

    if (reaction.message.id !== active.messageId) return false; // only the most recent call matters
    return matchesConfiguredEmoji(reaction.emoji);
  },

  async onAdd(reaction, user) {
    const active = store.getActive();
    const thread = await reaction.client.channels.fetch(active.threadId);
    
    await thread.members.add(user.id);
    if (thread.archived) await thread.setArchived(false);
  },

  async onRemove(reaction, user) {
    const active = store.getActive();
    const thread = await reaction.client.channels.fetch(active.threadId);

    await thread.members.remove(user.id);
  },
};