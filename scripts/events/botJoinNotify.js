module.exports = {
  config: {
    name: "botJoinNotify",
    eventType: ["log:subscribe"],
    version: "1.1",
    author: "Shourov Custom",
    description: "Notify when bot added to group"
  },

  onEvent: async function ({ api, event }) {
    try {

      const botID = api.getCurrentUserID();

      if (!event.logMessageData?.addedParticipants) return;

      if (event.logMessageData.addedParticipants.some(i => i.userFbId == botID)) {

        const message = 
`╔═══════════════╗
  🤖 AUTO SYSTEM ACTIVE
╚═══════════════╝

👑 Owner: 𝐀𝐥𝐢𝐡𝐬𝐚𝐧 𝐒𝐡𝐨𝐮𝐫𝐨𝐯
⚡ Bot Connected Successfully`;

        api.sendMessage(message, event.threadID);
      }

    } catch (err) {
      console.log("Join Notify Error:", err.message);
    }
  }
};