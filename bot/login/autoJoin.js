const fs = require("fs");
const path = require("path");

module.exports = async function (api) {
  try {
    const filePath = path.join(process.cwd(), "groups.json");

    // যদি file না থাকে → কিছু করবে না
    if (!fs.existsSync(filePath)) {
      console.log("groups.json not found");
      return;
    }

    let groups = JSON.parse(fs.readFileSync(filePath, "utf8"));

    if (!Array.isArray(groups) || groups.length === 0) {
      console.log("No saved groups found");
      return;
    }

    const botID = api.getCurrentUserID();

    for (const threadID of groups) {
      try {
        await api.addUserToGroup(botID, threadID);
        console.log("✅ Rejoined group:", threadID);
      } catch (err) {
        console.log("❌ Failed to rejoin:", threadID);
      }
    }

  } catch (err) {
    console.log("AutoJoin Error:", err.message);
  }
};