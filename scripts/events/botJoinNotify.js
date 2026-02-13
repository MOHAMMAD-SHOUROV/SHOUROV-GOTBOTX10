const { getStreamFromURL } = global.utils;

module.exports.config = {
  name: "botJoinNotify",
  category: "events",
  eventType: ["log:subscribe"],
  version: "1.1",
  author: "Shourov Custom",
  description: "Notify when bot added to group with image"
};

module.exports.run = async function ({ api, event }) {
  try {
    const botID = api.getCurrentUserID();

    if (
      event.logMessageData &&
      event.logMessageData.addedParticipants &&
      event.logMessageData.addedParticipants.some(i => i.userFbId == botID)
    ) {

      const message =
`╔═══════════════╗
  🤖 AUTO SYSTEM ACTIVE
╚═══════════════╝

👑 Owner: 𝐀𝐥𝐢𝐡𝐬𝐚𝐧 𝐒𝐡𝐨𝐮𝐫𝐨𝐯
🔄 ID Change Mode Enabled
⚡ Bot Connected Successfully`;

      const imageURL = "https://files.catbox.moe/625pbd.jpg";

      await api.sendMessage({
        body: message,
        attachment: await getStreamFromURL(imageURL)
      }, event.threadID);

      console.log("✅ Bot join notification sent");
    }

  } catch (err) {
    console.log("❌ Join Notify Error:", err.message);
  }
};