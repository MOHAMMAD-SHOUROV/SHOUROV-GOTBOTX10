const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { loadImage, createCanvas } = require("canvas");

module.exports = {
  config: {
    name: "mark",
    author: "Alihsan Shourov",
    countDown: 5,
    role: 0,
    category: "fun",
    guide: "{p}mark Your text here"
  },

  wrapText: async (ctx, text, maxWidth) => {
    const words = text.split(" ");
    const lines = [];
    let line = "";

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        lines.push(line.trim());
        line = words[n] + " ";
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { threadID, messageID } = event;
      const text = args.join(" ");

      if (!text)
        return api.sendMessage(
          "📝 Please enter text to write on board.",
          threadID,
          messageID
        );

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);

      const imagePath = path.join(cacheDir, `mark_${Date.now()}.png`);

      // ===== Load Background =====
      const bgBuffer = (
        await axios.get("https://i.postimg.cc/gJCXgKv4/zucc.jpg", {
          responseType: "arraybuffer",
        })
      ).data;

      fs.writeFileSync(imagePath, Buffer.from(bgBuffer));

      const baseImage = await loadImage(imagePath);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

      // ===== Auto Font Resize =====
      let fontSize = 60;
      do {
        fontSize--;
        ctx.font = `bold ${fontSize}px Arial`;
      } while (ctx.measureText(text).width > 470 && fontSize > 20);

      ctx.fillStyle = "#000000";
      ctx.textAlign = "start";

      const lines = await this.wrapText(ctx, text, 470);

      let y = 80;
      for (let line of lines) {
        ctx.fillText(line, 20, y);
        y += fontSize + 5;
      }

      fs.writeFileSync(imagePath, canvas.toBuffer());

      return api.sendMessage(
        { attachment: fs.createReadStream(imagePath) },
        threadID,
        () => fs.unlinkSync(imagePath),
        messageID
      );

    } catch (err) {
      console.error("MARK ERROR:", err);
      return api.sendMessage(
        "⚠️ Something went wrong.",
        event.threadID,
        event.messageID
      );
    }
  },
};