const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    version: "3.2.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    description: "Love banner with mention/reply",
    category: "fun",
    guide: "{p}love @mention OR reply someone"
  },

  onStart: async function ({ message, event, usersData }) {
    try {
      const senderID = event.senderID;

      const targetID =
        event.messageReply?.senderID ||
        Object.keys(event.mentions || {})[0];

      if (!targetID)
        return message.reply("❌ Please mention or reply someone!");

      // Avatar URLs
      const avatarURL1 = await usersData.getAvatarUrl(senderID);
      const avatarURL2 = await usersData.getAvatarUrl(targetID);

      // Load Banner
      const background = await loadImage("https://files.catbox.moe/2abtdf.jpg");

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0);

      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      // ===== PROFILE SETTINGS =====
      const radius = 165; // circle size
      const size = radius * 2;

      // LEFT PROFILE PERFECT CENTER
ctx.save();
ctx.beginPath();
ctx.arc(470, 470, 160, 0, Math.PI * 2); // circle center
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar1, 270, 270, 320, 320); // image center matched
ctx.restore();
      // RIGHT PROFILE PERFECT CENTER
ctx.save();
ctx.beginPath();
ctx.arc(1010, 470, 160, 0, Math.PI * 2); 
ctx.closePath();
ctx.clip();
ctx.drawImage(avatar2, 850, 270, 320, 320);
ctx.restore();
      // Save File
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `love_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      message.reply(
        {
          body: "❤️ Love is Beautiful 💞",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("LOVE ERROR:", err);
      message.reply("⚠️ Love command failed.");
    }
  }
};