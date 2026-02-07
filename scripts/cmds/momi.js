const axios = require("axios");

module.exports = {
  config: {
    name: "momoi",
    aliases: ["omaigotto"],
    version: "1.2",
    author: "Zihad Ahmed",
    shortDescription: "Generate audio using momoi voice",
    longDescription: "Send text or reply to a message 🐍",
    category: "momoi",
    guide: "{p}omaigotto <text> or reply to a message with {p}omaigotto",
  },

  onStart: async function ({ api, event, message, args }) {
    try {
      const text = args.join(" ") || event.messageReply?.body;
      if (!text) return message.reply("provide some text..!");

      // Safely set reaction (ignore errors)
      try {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);
      } catch (_) {}

      const audioUrl = `https://xihad-4-x.vercel.app/Tools/Momoi?txt=${encodeURIComponent(text)}&apikey=xihad`;

      const response = await axios({
        url: audioUrl,
        method: "GET",
        responseType: "stream"
      });

      await message.reply({
        body: `Momoi TTS`,
        attachment: response.data,
      });

      try {
        api.setMessageReaction("🩷", event.messageID, () => {}, true);
      } catch (_) {}

    } catch (error) {
      console.error("omaigotto error:", error);
      try {
        api.setMessageReaction("😓", event.messageID, () => {}, true);
      } catch (_) {}
      return message.reply("Failed to generate audio ❌");
    }
  },
};