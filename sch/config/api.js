const express = require('express');
const { ConfigReader } = require('./reader');



class ConfigAPIReader extends ConfigReader {
  path
  loaded
  app
  port
  endpoint

  constructor(options) {
    super();
    this.path = options?.path ?? "/json/Setting";
    if (options?.app) {
      this.app = options.app;
    } else if (options?.port) {
      this.port = options.port;
      const app = express();
      this.app = app;
      app.listen(this.port, console.log(`Config listening to port ${this.port} !!!`))
    }
    this.endpoint = options?.endpoint;
    this.loaded = false;
    this.config = { Hosts: [] }; //, Jobs: []
  }

  load() {
    if (!!this.app) {
      this.app.post(this.path, this.middleware)
      if (!!this.endpoint?.call) this.app.post(this.path, this.endpoint)
      return true;
    }
    return false;
  }
  update() {
    this.config = { Hosts: [] }; //, Jobs: []
    return true;
  }
  middleware = (req, res, next) => {
    let ans = "Config/Update: "
    // Update algorithm settings
    // req.body['Algorithms']?.forEach(alg => { });

    // Update Host settings
    req.body['Hosts']?.forEach(host => { this.config.Hosts.push(host) });

    // Update Job settings
    // req.body['Jobs']?.forEach(job => { this.config.Jobs.push(job) });
    this.loaded = true;
    if (!!this.endpoint?.call) {
      req.body.ans = ans;
      return next();
    }
    return res.json({ 'Message': ans });
  }
}

module.exports = {
  ConfigAPIReader,
}