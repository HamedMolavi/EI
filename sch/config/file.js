const { existsSync, readFileSync } = require("fs");
const yaml = require('js-yaml');
const { ConfigReader } = require('./reader');
const path = require("path")

class ConfigFileReader extends ConfigReader {
  constructor(options) {
    super();
    this.path = options?.path ?? path.join(__dirname, "../config.yml");
    this.loaded = false;
    this.config = {};
  }

  load() {
    if (!existsSync(this.path)) return false;
    const configFile = readFileSync(this.path, 'utf8');
    this.config = yaml.load(configFile);
    this.loaded = true;
    return true;
  }
  update() {
    return true;
  }
}

module.exports = {
  ConfigFileReader
}