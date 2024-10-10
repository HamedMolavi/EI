const { existsSync, readFileSync } = require("fs");
const yaml = require('js-yaml');
const { ConfigReader } = require('./reader');
const path = require("path")

class ConfigFileReader extends ConfigReader {
  constructor(options) {
    super();
    this.path = options?.path ?? path.join(__dirname, "../config.yml");
    this.loaded = false;
    this.config = {
      Hosts: [],
      // Jobs: []
    };
  }

  load() {
    if (!existsSync(this.path)) return false;
    const configFile = readFileSync(this.path, 'utf8');
    const config = yaml.load(configFile);
    const { Hosts } = config; //, Jobs
    this.config.Hosts = Hosts;
    // this.config.Jobs = Jobs;
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