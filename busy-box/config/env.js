const dotenv = require("dotenv");
const fs = require("fs");
const { join } = require("path");
const os = require('os');

function envConfigs() {
  try {
    dotenv.config({ path: join(__dirname, "../.env"), encoding: 'utf8', debug: false, override: true });
  } catch (err) {
    console.error("Error in reading key and pem...");
    console.error(err);
    process.exit(1);
  };
  process.busy = false;
  process.cpu = parseInt(process.env["CPU"] ?? "66446");
  process.mem = !!process.env["MEM"] ? parseInt(process.env["MEM"]) : os.totalmem() / 1024 / 1024;
  process.net = parseInt(process.env["NET"] ?? "1000");
};

module.exports = envConfigs;