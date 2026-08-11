const fs = require("fs");
const path = require("path");

// runtime state file
const STATE_FILE = path.join(__dirname, "creativeCallState.json");

/**
 * Tracks the  most recent creative call (message + thread).
 * Reactions on any older posts are ignored
 * compare a message ID against whats stored here.
 */

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null; // file dne
    console.error("[creativecall/store] Failed to read state file:", error);
    return null;
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function getActive() {
  return readState();
}

// Overwrites whatever was previously active
function setActive({ messageId, threadId, channelId }) {
  writeState({ messageId, threadId, channelId, updatedAt: new Date().toISOString() });
}

module.exports = { getActive, setActive };