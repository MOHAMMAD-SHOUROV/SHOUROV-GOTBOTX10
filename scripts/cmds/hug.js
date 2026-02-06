const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "hug",
    aliases: ["embrace"],
    version: "1.0",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    shortDescription: "Give someone a warm hug! 💕",
    longDescription: "A refreshed hug command with reconnection handling and beautiful design",
    category: "fun",
    guide: "{pn} @mention or reply to a message",
  },

  onStart: async function ({ event, api, usersData, args, resolveTargetID }) {
    let processingMsg;

    try {
      processingMsg = await api.sendMessage(
        "🔄 Preparing a warm hug for you...",
        event.threadID
      );

      const targetID = resolveTargetID(args, event);

      if (!targetID) {
        await api.sendMessage(
          "💝 Who would you like to hug? Please tag someone or reply to their message!",
          event.threadID,
          event.messageID
        );
        await api.unsendMessage(processingMsg.messageID);
        return;
      }

      if (targetID === event.senderID) {
        await api.sendMessage(
          "🤗 You can't hug yourself! But here's a virtual hug from me! 💕",
          event.threadID,
          event.messageID
        );
        await api.unsendMessage(processingMsg.messageID);
        return;
      }

      const huggerID = event.senderID;

      const huggerName =
        (await usersData.getName(huggerID)) || "Someone";

      const targetName =
        (event.mentions && event.mentions[targetID]) ||
        (await usersData.getName(targetID)) ||
        "Friend";

      const getAvatar = async (uid, retry = 0) => {
        try {
          const url = `https://graph.facebook.com/${uid}/picture?width=512&height=512`;
          const dir = path.join(__dirname, "tmp");
          if (!fs.existsSync(dir)) fs.mkdirSync(dir);

          const avatarPath = path.join(dir, `${uid}.png`);
          const res = await axios.get(url, { responseType: "arraybuffer" });
          fs.writeFileSync(avatarPath, res.data);
          return avatarPath;
        } catch (e) {
          if (retry < 2) return getAvatar(uid, retry + 1);
          return null;
        }
      };

      await api.sendMessage(
        "📸 Getting avatars and creating your hug...",
        event.threadID,
        processingMsg.messageID
      );

      let bg;
      try {
        bg = await loadImage("https://files.catbox.moe/n7x1vy.jpg");
      } catch {
        bg = { width: 800, height: 600 };
      }

      const canvas = createCanvas(bg.width || 800, bg.height || 600);
      const ctx = canvas.getContext("2d");

      if (bg.width) {
        ctx.drawImage(bg, 0, 0);
      } else {
        const g = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        g.addColorStop(0, "#FFB6C1");
        g.addColorStop(1, "#FF69B4");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const huggerAvatarPath = await getAvatar(huggerID);
      const targetAvatarPath = await getAvatar(targetID);

      if (!huggerAvatarPath || !targetAvatarPath) {
        await api.sendMessage(
          "❌ Failed to load avatars. Try again later.",
          event.threadID
        );
        await api.unsendMessage(processingMsg.messageID);
        return;
      }

      const huggerAvatar = await loadImage(huggerAvatarPath);
      const targetAvatar = await loadImage(targetAvatarPath);

      ctx.save();
      ctx.beginPath();
      ctx.arc(285, 160, 50, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(huggerAvatar, 235, 110, 110, 100);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(390, 200, 50, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(targetAvatar, 340, 150, 100, 100);
      ctx.restore();

      ctx.font = "bold 32px Arial";
      ctx.fillStyle = "#FF1493";
      ctx.textAlign = "center";
      ctx.fillText("💕 Virtual Hug 💕", canvas.width / 2, 50);

      ctx.font = "bold 22px Arial";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(huggerName, 210, 400);
      ctx.fillText(targetName, 490, 400);

      ctx.strokeStyle = "#FF69B4";
      ctx.lineWidth = 10;
      ctx.strokeRect(0, 0, canvas.width, canvas.height);

      const output = path.join(__dirname, "tmp/hug_output.png");
      fs.writeFileSync(output, canvas.toBuffer("image/png"));

      const messages = [
        `💝 ${huggerName} just gave ${targetName} a warm hug! 🥰`,
        `🤗 ${huggerName} hugs ${targetName} tightly! 💕`,
        `💞 ${huggerName} sends a sweet hug to ${targetName}!`
      ];

      await api.sendMessage(
        {
          body: messages[Math.floor(Math.random() * messages.length)],
          attachment: fs.createReadStream(output),
          mentions: [
            { tag: huggerName, id: huggerID },
            { tag: targetName, id: targetID }
          ]
        },
        event.threadID
      );

      fs.unlinkSync(output);
      fs.unlinkSync(huggerAvatarPath);
      fs.unlinkSync(targetAvatarPath);
      await api.unsendMessage(processingMsg.messageID);

    } catch (err) {
      console.error("HUG ERROR:", err);
      if (processingMsg?.messageID)
        await api.unsendMessage(processingMsg.messageID);
      await api.sendMessage(
        "❌ Something went wrong while making the hug 😔",
        event.threadID
      );
    }
  },

  onReconnect() {
    console.log("🔄 Hug command ready after reconnect");
  }
};