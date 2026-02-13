module.exports = {
  config: {
    name: "groupNotify",
    eventType: ["log:subscribe", "log:unsubscribe"],
    version: "1.0",
    author: "Shourov System"
  },

  onStart: async function ({ api, event }) {

    const ownerList = global.GoatBot.config.devUsers || [];
    const botID = api.getCurrentUserID();

    // 🔹 BOT ADDED TO GROUP
    if (event.logMessageType === "log:subscribe") {

      const added = event.logMessageData.addedParticipants;

      // If bot added
      if (added.some(u => u.userFbId == botID)) {

        // Welcome message in group
        api.sendMessage(
`╔═══════════════╗
  🤖 AUTO SYSTEM ACTIVE
╚═══════════════╝

👑 Owner: Alihsan Shourov
⚡ Bot Connected Successfully`,
          event.threadID
        );

        // Notify owner
        for (const uid of ownerList) {
          await api.sendMessage(
            `✅ Bot added to new group\n\n🆔 Group ID: ${event.threadID}`,
            uid
          );
        }
      }
    }

    // 🔹 BOT KICKED FROM GROUP
    if (event.logMessageType === "log:unsubscribe") {

      if (event.logMessageData.leftParticipantFbId == botID) {

        for (const uid of ownerList) {
          await api.sendMessage(
            `❌ Bot was removed from group\n\n🆔 Group ID: ${event.threadID}`,
            uid
          );
        }
      }
    }
  }
};