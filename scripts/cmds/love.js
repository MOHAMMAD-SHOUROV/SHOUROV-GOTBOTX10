const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    aliases: ["lovecouple"],
    version: "2.0.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    description: "Make love photo with mention or reply",
    category: "fun",
    guide: "{p}love @mention OR reply someone"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const { senderID } = event;

      // ===== Get Target =====
      const targetID =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0];

      if (!targetID)
        return message.reply("💚 Please mention or reply someone you love!");

      // ===== Get Avatar URLs =====
      const avatar1 = await usersData.getAvatarUrl(senderID);
      const avatar2 = await usersData.getAvatarUrl(targetID);

      // ===== Read Images =====
      const avOne = await jimp.read(avatar1);
      const avTwo = await jimp.read(avatar2);

      avOne.circle();
      avTwo.circle();

      const background = await jimp.read(
        "https://i.imgur.com/LjpG3CW.jpeg"
      );

      background
        .resize(1440, 1080)
        .composite(avOne.resize(470, 470), 125, 210)
        .composite(avTwo.resize(470, 470), 800, 200);

      // ===== Temp Folder =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const outputPath = path.join(
        tmpDir,
        `love_${Date.now()}.png`
      );

      await background.writeAsync(outputPath);

      message.reply(
        {
          body: "❤️ Love is beautiful... 💔🥀",
          attachment: fs.createReadStream(outputPath)
        },
        () => fs.unlinkSync(outputPath)
      );

    } catch (error) {
      console.error(error);
      message.reply("⚠️ Something went wrong. Try again later.");
    }
  }
};