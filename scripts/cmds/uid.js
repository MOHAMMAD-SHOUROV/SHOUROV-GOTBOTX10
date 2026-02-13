const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
  config: {
    name: "uid",
    version: "4.0.0",
    author: "Alihsan Shourov (Fixed)",
    countDown: 5,
    role: 0,
    description: "View Facebook UID",
    category: "info",
    guide: "{p}uid | {p}uid @mention | {p}uid profile_link | reply + uid"
  },

  onStart: async function ({ api, message, event, args }) {
    try {
      const { mentions, messageReply, senderID } = event;

      // 🔹 Reply Support
      if (messageReply?.senderID) {
        return message.reply(`🆔 UID: ${messageReply.senderID}`);
      }

      // 🔹 Mention Support
      if (Object.keys(mentions || {}).length > 0) {
        let msg = "";
        for (const id in mentions) {
          msg += `👤 ${mentions[id].replace("@", "")}\n🆔 ${id}\n\n`;
        }
        return message.reply(msg.trim());
      }

      // 🔹 Self UID
      if (!args[0]) {
        return message.reply(`🆔 Your UID: ${senderID}`);
      }

      // 🔹 Profile Link Support (NEW SYSTEM)
      if (regExCheckURL.test(args[0])) {

        try {
          const data = await api.getUserID(args[0]);
          if (!data || !data[0])
            return message.reply("❌ Unable to fetch UID from link.");

          return message.reply(`🔗 ${args[0]}\n🆔 ${data[0].userID}`);
        } catch {
          return message.reply("❌ Invalid profile link.");
        }
      }

      return message.reply("❌ Invalid input.");

    } catch (err) {
      console.error("UID ERROR:", err);
      return message.reply("⚠️ Failed to fetch UID.");
    }
  }
};