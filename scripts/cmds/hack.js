const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "hack",
    version: "2.0.0",
    author: "Alihsan Shourov (Fixed)",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{pn} @mention | reply | uid"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { senderID, messageReply, mentions } = event;

      // ===== GET TARGET ID =====
      let targetID;

      if (args[0] && !isNaN(args[0])) {
        targetID = args[0]; // UID support
      } else if (messageReply?.senderID) {
        targetID = messageReply.senderID; // Reply support
      } else if (mentions && Object.keys(mentions).length > 0) {
        targetID = Object.keys(mentions)[0]; // Mention support
      } else {
        targetID = senderID; // Default self
      }

      // ===== GET USER NAME =====
      const userInfo = await api.getUserInfo(targetID);
      const userName = userInfo[targetID]?.name || "Unknown User";

      // ===== PATH SETUP =====
      const tmpDir = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

      const bgPath = path.join(tmpDir, `hack_bg_${Date.now()}.png`);
      const avatarPath = path.join(tmpDir, `hack_avt_${Date.now()}.png`);

      // ===== DOWNLOAD AVATAR =====
      const avatar = await jimp.read(
  `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379|c1e620fa708a1d5696fb991c1bde5662`
);
          { responseType: "arraybuffer" }
        )
      ).data;

      fs.writeFileSync(avatarPath, Buffer.from(avatarBuffer));

      // ===== DOWNLOAD BACKGROUND =====
      const bgBuffer = (
        await axios.get(
          "https://files.catbox.moe/ibmk54.jpg",
          { responseType: "arraybuffer" }
        )
      ).data;

      fs.writeFileSync(bgPath, Buffer.from(bgBuffer));

      // ===== CANVAS WORK =====
      const background = await loadImage(bgPath);
      const avatar = await loadImage(avatarPath);

      const canvas = createCanvas(background.width, background.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      // Name text
      ctx.font = "bold 28px Arial";
      ctx.fillStyle = "#00ff00";
      ctx.fillText(userName, 150, 450);

      // Avatar
      ctx.drawImage(avatar, 60, 400, 80, 80);

      const finalPath = path.join(tmpDir, `hack_final_${Date.now()}.png`);
      fs.writeFileSync(finalPath, canvas.toBuffer());

      // ===== CLEAN TEMP FILES =====
      fs.removeSync(bgPath);
      fs.removeSync(avatarPath);

      return api.sendMessage(
        {
          body:
            "💻 SYSTEM BREACHED!\n" +
            `🔓 ${userName} has been hacked successfully!\n\n` +
            "⚠️ Just kidding 😎",
          attachment: fs.createReadStream(finalPath),
        },
        event.threadID,
        () => fs.unlinkSync(finalPath),
        event.messageID
      );

    } catch (err) {
      console.error("HACK ERROR:", err);
      return api.sendMessage(
        "❌ Error generating hack image!",
        event.threadID,
        event.messageID
      );
    }
  }
};