const fs = require("fs");
const path = require("path");

module.exports = async function(api) {

  const filePath = path.join(process.cwd(), "groups.json");

  if (!fs.existsSync(filePath)) return;

  const groups = JSON.parse(fs.readFileSync(filePath));

  for (const threadID of groups) {
    try {
      await api.addUserToGroup(api.getCurrentUserID(), threadID);
      console.log("Rejoined group:", threadID);
    } catch (err) {
      console.log("Failed to rejoin:", threadID);
    }
  }
};