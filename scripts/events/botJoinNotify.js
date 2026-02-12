const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "botJoinNotify",
    eventType: ["log:subscribe"],
    version: "1.1",
    author: "Shourov Custom",
    description: "Notify when bot added to group with image",
  },

  onStart: async function ({ api, event }) {
    try {
      const botID = api.getCurrentUserID();

      // Check if bot itself was added
      if (event.logMessageData.addedParticipants.some(i => i.userFbId == botID)) {

        const message = 
`╔═══════════════╗
  🤖 AUTO SYSTEM ACTIVE
╚═══════════════╝

👑 Owner: 𝐀𝐥𝐢𝐡𝐬𝐚𝐧 𝐒𝐡𝐨𝐮𝐫𝐨𝐯
🔄 ID Change Mode Enabled
⚡ Bot Connected Successfully`;

        const imageURL = "https://files.catbox.moe/625pbd.jpg";

        api.sendMessage({
          body: message,
          attachment: await getStreamFromURL(imageURL)
        }, event.threadID);
      }

    } catch (err) {
      console.log("Join Notify Error:", err.message);
    }
  }
};