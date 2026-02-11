const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    version: "3.0.0",
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

      // ===== Get Avatar URLs =====
      const avatarURL1 = await usersData.getAvatarUrl(senderID);
      const avatarURL2 = await usersData.getAvatarUrl(targetID);

      // ===== Create Canvas (Banner Size) =====
      const canvas = createCanvas(1440, 1080);
      const ctx = canvas.getContext("2d");

      // ===== Load Background (Your Banner) =====
      const background = await loadImage(
        "https://files.catbox.moe/2abtdf.jpg"
      );

      ctx.drawImage(background, 0, 0, 1440, 1080);

      const avatar1 = await loadImage(avatarURL1);
      const avatar2 = await loadImage(avatarURL2);

      // ===== LEFT USER (BOY) =====
      ctx.save();
      ctx.beginPath();
      ctx.arc(430, 540, 210, 0, Math.PI * 2); // Position + Radius
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 220, 330, 420, 420);
      ctx.restore();

      // ===== RIGHT USER (GIRL) =====
      ctx.save();
      ctx.beginPath();
      ctx.arc(1010, 540, 210, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, 800, 330, 420, 420);
      ctx.restore();

      // ===== TEMP FOLDER =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const filePath = path.join(tmpDir, `love_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer());

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