class ConfigReader {
  path
  loaded

  constructor() {
    this.path = "";
    this.loaded = false;
  }

  load() {
    return true;
  }
  update() {
    return true;
  }
}

module.exports = {
  ConfigReader,
}