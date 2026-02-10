const moment = require("moment-timezone");
const axios = require("axios");

module.exports = {
  config: {
    name: "autotime",
    version: "3.5",
    role: 0,
    author: "Alihsan Shourov",
    description: "Auto time message with on/off & video",
    category: "AutoTime",
    countDown: 3
  },

  // ================= ON / OFF COMMAND =================
  onStart: async ({ event, message }) => {
    const { threadID, args } = event;

    if (!args[0] || !["on", "off"].includes(args[0])) {
      return message.reply("❌ Use:\n/autotime on\n/autotime off");
    }

    if (!global.db.allThreadData) global.db.allThreadData = [];

    let thread = global.db.allThreadData.find(t => t.threadID == threadID);
    if (!thread) {
      thread = { threadID, data: {} };
      global.db.allThreadData.push(thread);
    }

    if (!thread.data) thread.data = {};
    thread.data.autoTime = args[0] === "on";

    return message.reply(`✅ AutoTime ${args[0].toUpperCase()} successfully`);
  },

  // ================= AUTO CORE =================
  onLoad: ({ api }) => {
    if (!global.db) global.db = {};
    if (!global.db.allThreadData) global.db.allThreadData = [];

    /* ===== VIDEO LIST ===== */
    const VIDEO_LIST = [
  "https://files.catbox.moe/2t76v9.mp4",
  "https://files.catbox.moe/bzbs8p.mp4",
  "https://files.catbox.moe/wsx6is.mp4",
  "https://files.catbox.moe/fezghq.mp4",
  "https://files.catbox.moe/67hscm.mp4",
  "https://files.catbox.moe/7adomy.mp4",
  "https://files.catbox.moe/drvdqx.mp4",
  "https://files.catbox.moe/bswirx.mp4",
  "https://files.catbox.moe/zuqiy8.mp4",
  "https://files.catbox.moe/g9rlfi.mp4",
  "https://files.catbox.moe/gi8zcg.mp4",
  "https://files.catbox.moe/v3fe33.mp4",
  "https://files.catbox.moe/mztrnl.mp4",
  "https://files.catbox.moe/l4el1b.mp4",
  "https://files.catbox.moe/b1o090.mp4",
  "https://files.catbox.moe/99xtk5.mp4",
  "https://files.catbox.moe/axup1b.mp4",
  "https://files.catbox.moe/2dqwbl.mp4",
  "https://files.catbox.moe/bhpehz.mp4",
  "https://files.catbox.moe/bs5c9g.mp4",
  "https://files.catbox.moe/niafel.mp4",
  "https://files.catbox.moe/bggjju.mp4",
  "https://files.catbox.moe/1d9xsl.mp4"
];

    const getRandomVideo = async () => {
      const url = VIDEO_LIST[Math.floor(Math.random() * VIDEO_LIST.length)];
      const res = await axios.get(url, { responseType: "stream" });
      return res.data;
    };

    /* ===== ALL TIME DATA (FULL – একটাও বাদ নাই) ===== */
    const TIME_DATA = {
      "12:00 AM": "🩷 TIME 12:00 AM\nঘুমাও মানুষটা তোমার না 🙂",
      "01:00 AM": "🩷 TIME 01:00 AM\nএই শহরে সব হয়, আমার মৃত্যু ছাড়া 🥺",
      "02:00 AM": "🩷 TIME 02:00 AM\nএকদিন অজান্তেই হারিয়ে যাবো 🥀",
      "03:00 AM": "🩷 TIME 03:00 AM\nদুঃখ আমায় ভালোবাসে 😅",
      "04:00 AM": "🩷 TIME 04:00 AM\nবয়স বাড়বে, হারানোর তালিকা বড় হবে 🦋",
      "04:30 AM": "🌸 Every Muslim Identity 🌸",
      "05:00 AM": "🩷 TIME 05:00 AM\nঅপূর্ণ ইচ্ছেগুলোই সবচেয়ে বেশি কাঁদায় 💔",
      "06:00 AM": "🩷 TIME 06:00 AM\nExtreme pride মানুষকে হারায় 🙂",
      "07:00 AM": "🩷 TIME 07:00 AM\nIn Sha Allah একদিন… 🖤",
      "08:00 AM": "🩷 TIME 08:00 AM\nBe Mine 💖",
      "09:00 AM": "🩷 TIME 09:00 AM\nTrust Me 🔐",
      "10:00 AM": "🩷 TIME 10:00 AM\nগল্পটা তখনই সুন্দর ছিলো 🌸",
      "11:00 AM": "🩷 TIME 11:00 AM\nপূর্ণতায় তাকেই রাখবো 🖤",
      "12:00 PM": "🩷 TIME 12:00 PM\nভালোবাসি শব্দটা খুবই অদ্ভুত 💞",
      "01:00 PM": "🩷 TIME 01:00 PM\nসর্বহারা পথিকের অস্তিত্ব 😅",
      "02:00 PM": "🩷 TIME 02:00 PM\nLife is beautiful if you don't fall in love",
      "03:00 PM": "🩷 TIME 03:00 PM\nPehli Nazar Mein ✨",
      "04:00 PM": "🩷 TIME 04:00 PM\nস্বপ্নগুলো কল্পনাতেই ভালো 🌺",
      "05:00 PM": "🩷 TIME 05:00 PM\nআমি সেই গল্পের বই 📖",
      "06:00 PM": "🩷 TIME 06:00 PM\nমাগরিবের নামাজ পড়ে নিও 🕌",
      "06:30 PM": "🌸 Every Muslim Identity 🌸",
      "07:00 PM": "🩷 TIME 07:00 PM\nপড়তে বসো সবাই 📚",
      "08:00 PM": "🩷 TIME 08:00 PM\nএশার নামাজ পড়ে নিও ❤️",
      "09:00 PM": "🩷 TIME 09:00 PM\nরাতের খাবার খাও 🍽️",
      "10:00 PM": "🩷 TIME 10:00 PM\nঘুমাও ভাই 😭",
      "11:00 PM": "🩷 TIME 11:00 PM\nকিছু ব্যথা কখনো সারেনা 🖤"
    };

    let lastSent = "";

    setInterval(async () => {
      const now = moment().tz("Asia/Dhaka");
      const timeKey = now.format("hh:mm A");

      if (!TIME_DATA[timeKey]) return;
      if (lastSent === timeKey) return;

      for (const thread of global.db.allThreadData) {
        if (!thread.data || !thread.data.autoTime) continue;

        try {
          await api.sendMessage(
            {
              body: TIME_DATA[timeKey],
              attachment: await getRandomVideo()
            },
            thread.threadID
          );
        } catch (e) {
          console.log("AutoTime error:", e.message);
        }
      }

      lastSent = timeKey;
    }, 30 * 1000);
  }
};