const dotenv = require("dotenv");
const { join } = require("path");

function envConfigs() {
  try {
    dotenv.config({ path: join(__dirname, "../.env"), encoding: 'utf8', debug: false, override: true });
  } catch (err) {
    console.error("Error in reading env file...");
    console.error(err);
    process.exit(1);
  };
};

module.exports = envConfigs;