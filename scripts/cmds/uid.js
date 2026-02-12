const { findUid } = global.utils;

const regExCheckURL = /^(http|https):\/\/[^ "]+$/;

module.exports = {
  config: {
    name: "uid",
    version: "2.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    description: "View Facebook UID",
    category: "info",
    guide: "{p}uid | {p}uid @mention | {p}uid profile_link | reply + uid"
  },

  onStart: async function ({ message, event, args, resolveTargetID }) {
    try {
      const { mentions, messageReply, senderID } = event;

      // ===== REPLY OR MENTION =====
      const targetID = resolveTargetID(args);

      if (targetID) {
        return message.reply(`🆔 UID: ${targetID}`);
      }

      // ===== NO ARG = OWN UID =====
      if (!args[0]) {
        return message.reply(`🆔 Your UID: ${senderID}`);
      }

      // ===== PROFILE LINK =====
      if (args[0].match(regExCheckURL)) {
        let result = "";

        for (const link of args) {
          try {
            const uid = await findUid(link);
            result += `🔗 ${link}\n🆔 ${uid}\n\n`;
          } catch (e) {
            result += `❌ ${link}\nError: ${e.message}\n\n`;
          }
        }

        return message.reply(result);
      }

      // ===== MULTIPLE MENTION =====
      let msg = "";

      for (const id in mentions) {
        msg += `👤 ${mentions[id].replace("@", "")}\n🆔 ${id}\n\n`;
      }

      if (!msg) {
        return message.reply("❌ Invalid input. Use mention, reply or profile link.");
      }

      return message.reply(msg);

    } catch (err) {
      console.error("UID ERROR:", err);
      return message.reply("⚠️ Failed to fetch UID.");
    }
  }
};