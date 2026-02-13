const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "autoSaveGroup",
    eventType: ["log:subscribe"],
    version: "1.0",
    author: "Shourov"
  },

  onStart: async ({ api, event }) => {

    const botID = api.getCurrentUserID();

    if (event.logMessageData.addedParticipants.some(i => i.userFbId == botID)) {

      const filePath = path.join(process.cwd(), "groups.json");
      let groups = [];

      if (fs.existsSync(filePath)) {
        groups = JSON.parse(fs.readFileSync(filePath));
      }

      if (!groups.includes(event.threadID)) {
        groups.push(event.threadID);
        fs.writeFileSync(filePath, JSON.stringify(groups, null, 2));
      }
    }
  }
};