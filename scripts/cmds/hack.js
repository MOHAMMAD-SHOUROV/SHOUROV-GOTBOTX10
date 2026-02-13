const fs = require("fs-extra");
const { createCanvas, loadImage } = require("canvas");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "5.0.0",
    author: "Alihsan Shourov (UID Edition)",
    countDown: 5,
    role: 0,
    description: "Fake hack banner with UID support",
    category: "fun",
    guide: "{p}hack @mention | reply | uid"
  },

  onStart: async function ({ message, event, args, usersData }) {
    try {
      const senderID = event.senderID;

      // ===== TARGET DETECT =====
      let targetID;

      // UID support
      if (args[0] && !isNaN(args[0])) {
        targetID = args[0];
      }
      // Reply support
      else if (event.messageReply?.senderID) {
        targetID = event.messageReply.senderID;
      }
      // Mention support
      else if (Object.keys(event.mentions || {}).length > 0) {
        targetID = Object.keys(event.mentions)[0];
      }
      // Default self
      else {
        targetID = senderID;
      }

      // ===== USER INFO =====
      const userName = await usersData.getName(targetID);
      const avatarURL = await usersData.getAvatarUrl(targetID);

      // ===== LOAD BACKGROUND =====
      const background = await loadImage("https://files.catbox.moe/ibmk54.jpg");

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0);

      const avatar = await loadImage(avatarURL);

      // ===== ROUND AVATAR =====
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 140;

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY - 60, radius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(
        avatar,
        centerX - radius,
        centerY - 60 - radius,
        radius * 2,
        radius * 2
      );
      ctx.restore();

      // Border
      ctx.beginPath();
      ctx.arc(centerX, centerY - 60, radius, 0, Math.PI * 2);
      ctx.lineWidth = 6;
      ctx.strokeStyle = "#00ff00";
      ctx.stroke();

      // ===== TEXT =====
      ctx.textAlign = "center";

      ctx.font = "bold 40px Arial";
      ctx.fillStyle = "#00ff00";
      ctx.fillText("SYSTEM BREACHED", centerX, canvas.height - 180);

      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#ffffff";
      ctx.fillText(userName, centerX, canvas.height - 130);

      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#ff0000";
      ctx.fillText(`UID: ${targetID}`, centerX, canvas.height - 90);

      // ===== SAVE FILE =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const filePath = path.join(tmpDir, `hack_${Date.now()}.png`);
      fs.writeFileSync(filePath, canvas.toBuffer("image/png"));

      return message.reply(
        {
          body:
            "💻 SYSTEM BREACHED!\n\n" +
            `🔓 ${userName} hacked successfully!\n` +
            `🆔 UID: ${targetID}\n\n` +
            "⚠️ Just kidding 😎",
          attachment: fs.createReadStream(filePath)
        },
        () => fs.unlinkSync(filePath)
      );

    } catch (err) {
      console.error("HACK ERROR:", err);
      return message.reply("❌ Hack command failed.");
    }
  }
};