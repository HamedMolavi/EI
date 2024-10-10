const express = require('express');
const { ConfigReader } = require('./reader');
const { K8Host } = require('../cluster/host');



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
      this.app.post(this.path, this.addMiddleware);
      this.app.delete(this.path, this.removeMiddleware);
      if (!!this.endpoint?.call) this.app.post(this.path, this.endpoint);
      return true;
    }
    return false;
  }
  update() {
    this.config = { Hosts: [] }; //, Jobs: []
    return true;
  }
  addMiddleware = (req, res, next) => {
    let ans = "Config/Update:"
    // Update algorithm settings
    // req.body['Algorithms']?.forEach(alg => { });

    // Update Host settings
    req.body['Hosts']?.forEach(host => {
      if (!!process.conf.hosts.some(el => el.id === host.id)) return ans += ` host ${host.id} already exists;`;
      process.conf.hosts.push(new K8Host(host));
      this.config.Hosts.push(host);
      ans += ` host ${host.id} added;`
      console.log("New host added!", host);
    });

    // Update Job settings
    // req.body['Jobs']?.forEach(job => { this.config.Jobs.push(job) });
    this.loaded = true;
    if (!!this.endpoint?.call) {
      req.body.ans = ans;
      return next();
    }
    return res.json({ 'Message': ans });
  }
  removeMiddleware = (req, res, next) => {
    let ans = "Config/Delete:"
    // Delete algorithm settings
    // req.body['Algorithms']?.forEach(alg => { });

    // Delete Host settings
    process.conf.hosts = process.conf.hosts.filter(el => {
      const flag = !!req.body['Hosts']?.some(host => el.id === host.id);
      if (flag) {
        ans += ` host ${el.id} Deleted;`
        console.log("Deleted host!", el);
      }
      return !flag;
    })
    // Delete Job settings
    // req.body['Jobs']?.forEach(job => { this.config.Jobs.push(job) });
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