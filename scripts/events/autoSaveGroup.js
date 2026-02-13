fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "autoSaveGroup",
  category: "events",
  eventType: ["log:subscribe"],
  version: "1.0",
  author: "Shourov",
  description: "Auto save group when bot added"
};

module.exports.run = async function ({ api, event }) {
  try {
    const botID = api.getCurrentUserID();

    if (
      event.logMessageData &&
      event.logMessageData.addedParticipants &&
      event.logMessageData.addedParticipants.some(i => i.userFbId == botID)
    ) {

      const filePath = path.join(process.cwd(), "groups.json");
      let groups = [];

      if (fs.existsSync(filePath)) {
        groups = JSON.parse(fs.readFileSync(filePath, "utf8"));
      }

      if (!groups.includes(event.threadID)) {
        groups.push(event.threadID);
        fs.writeFileSync(filePath, JSON.stringify(groups, null, 2));
        console.log("✅ Group saved:", event.threadID);
      }
    }

  } catch (err) {
    console.log("❌ autoSaveGroup error:", err.message);
  }
};