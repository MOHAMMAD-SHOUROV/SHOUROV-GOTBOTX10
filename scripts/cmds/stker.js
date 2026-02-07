const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "sticker",
    aliases: ["st"],
    version: "14.5",
    author: "Zihad Ahmed",
    countDown: 2,
    role: 0,
    shortDescription: "Sticker management system",
    longDescription: "Sticker pathale bot reply dibe. JSON file auto create hobe.",
    category: "system",
    guide: {
      en: "{pn} [add | list | delete] [ID]"
    }
  },

  onLoad: async function () {
    const cacheDir = path.join(__dirname, "cache");
    const pathFile = path.join(cacheDir, "emoji_data.json");

    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    if (!fs.existsSync(pathFile)) {
      const defaultData = {
        list: [
          "2041012262792914", "456536873422758", "456537923422653", 
          "788171644590353", "456539756755803", "456538446755934",
          "2041021119458695", "2041015016125972", "456545803421865"
        ],
        lastSent: {}
      };
      fs.writeJsonSync(pathFile, defaultData, { spaces: 2 });
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID, type, messageReply } = event;
    const pathFile = path.join(__dirname, "cache", "emoji_data.json");
    const adminUID = "61579049651471"; 

    if (!fs.existsSync(pathFile)) return api.sendMessage("⚠ JSON missing!", threadID, messageID);
    let data = fs.readJsonSync(pathFile);
    
    const action = args[0]?.toLowerCase();

    if (["add", "delete"].includes(action) && senderID !== adminUID) {
      return api.sendMessage("❌ Only Admin Akash can manage this.", threadID, messageID);
    }

    if (action === "add") {
      let newID;
      
      // এখানে চেক করা হচ্ছে যে স্টিকারে রিপ্লাই দেওয়া হয়েছে কি না
      if (type === "message_reply" && messageReply.attachments && messageReply.attachments[0]?.type === "sticker") {
        newID = messageReply.attachments[0].ID;
      } else {
        newID = args[1];
      }

      if (!newID) return api.sendMessage("⚠ Please reply to a sticker or provide an ID to add.", threadID, messageID);
      
      if (data.list.includes(newID.toString())) {
        return api.sendMessage(`❌ This sticker ID (${newID}) is already in the list.`, threadID, messageID);
      }
      
      data.list.push(newID.toString());
      fs.writeJsonSync(pathFile, data, { spaces: 2 });
      return api.sendMessage(`✅ Added Sticker ID: ${newID}`, threadID, messageID);
    }

    if (action === "list") {
      if (data.list.length === 0) return api.sendMessage("📜 List empty!", threadID, messageID);
      let msg = "📜 𝗔𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲 𝗦𝘁𝗶𝗰𝗸𝗲𝗿𝘀:\n━━━━━━━━━━━━━\n";
      data.list.forEach((id, i) => msg += `[${i + 1}] ${id}\n`);
      return api.sendMessage(msg, threadID, messageID);
    }

    if (action === "delete") {
      const targetID = args[1];
      if (!targetID) return api.sendMessage("⚠ deletion এর জন্য ID দিন।", threadID, messageID);
      
      if (!data.list.includes(targetID)) return api.sendMessage("❌ এই ID লিস্টে নেই।", threadID, messageID);
      
      data.list = data.list.filter(id => id !== targetID);
      fs.writeJsonSync(pathFile, data, { spaces: 2 });
      return api.sendMessage(`🗑 Deleted: ${targetID}`, threadID, messageID);
    }

    return api.sendMessage("⚙ 𝗨𝘀𝗮𝗴𝗲:\nst add [Reply to Sticker/ID]\nst list\nst delete [ID]", threadID, messageID);
  },

  onChat: async function ({ api, event }) {
    if (event.type !== "message" || !event.attachments || event.attachments[0]?.type !== "sticker") return;

    const { threadID, messageID } = event;
    const pathFile = path.join(__dirname, "cache", "emoji_data.json");
    
    try {
      if (!fs.existsSync(pathFile)) return;
      let data = fs.readJsonSync(pathFile);
      if (!data.list || data.list.length === 0) return;

      let availableStickers = data.list.filter(id => id !== data.lastSent?.[threadID]);
      if (availableStickers.length === 0) availableStickers = data.list;

      const randomSticker = availableStickers[Math.floor(Math.random() * availableStickers.length)];
      
      if (!data.lastSent) data.lastSent = {};
      data.lastSent[threadID] = randomSticker;
      fs.writeJsonSync(pathFile, data, { spaces: 2 });

      return api.sendMessage({ sticker: randomSticker }, threadID, messageID);
    } catch (e) {
      console.log(e);
    }
  }
};