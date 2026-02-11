const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    version: "5.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{p}love @mention OR reply someone"
  },

  onStart: async function ({ message, event }) {
    try {
      const one = event.senderID;
      const two =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0];

      if (!two)
        return message.reply("💚 Please mention or reply someone!");

      // ✅ Avatar without access token
      const avone = await jimp.read(
        `https://graph.facebook.com/${one}/picture?width=512&height=512`
      );

      const avtwo = await jimp.read(
        `https://graph.facebook.com/${two}/picture?width=512&height=512`
      );

      avone.circle();
      avtwo.circle();

      const background = await jimp.read(
        "https://i.imgur.com/LjpG3CW.jpeg"
      );

      background
        .resize(1440, 1080)
        .composite(avone.resize(470, 470), 125, 210)
        .composite(avtwo.resize(470, 470), 800, 200);

      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `love_${Date.now()}.png`);

      await background.writeAsync(filePath);

      await message.reply(
        {
          body: "❤️ Love is beautiful 💞",
          attachment: fs.createReadStream(filePath)
        }
      );

      fs.unlinkSync(filePath);

    } catch (err) {
      console.log("LOVE ERROR:", err);
      message.reply("⚠️ Love command error. Check console.");
    }
  }
};