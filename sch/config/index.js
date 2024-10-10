const { K8Host } = require("../cluster/host");
const { K8Job } = require("../cluster/job");
const { ConfigAPIReader } = require("./api");
const { ConfigFileReader } = require("./file");





class Config {
  hosts
  // jobs
  fileReader
  apiReader
  constructor(options) {
    this.hosts = [];
    // this.jobs = [];
    this.fileReader = undefined;
    this.apiReader = undefined;
    // read config from file
    try {
      this.fileReader = new ConfigFileReader({ path: options?.filePath });
      if (!this.fileReader.load()) console.error("Reading config from file was not successful!");
      else {
        this.fileReader?.config?.Hosts?.forEach((host) => this.hosts.push(new K8Host(host)))
        // this.fileReader?.config?.Jobs?.forEach((job) => this.jobs.push(new K8Job(job)))
      }
    } catch (error) {
      console.error("Reading config from file was not successful!");
      console.error(error)
    }
    // run config reader from api
    try {
      const endpoint = (req, res) => {
        // Update Host settings
        req.body['Hosts']?.forEach(host => { this.hosts.push(new K8Host(host)) });
        // Update Job settings
        // req.body['Jobs']?.forEach(job => { this.jobs.push(new K8Job(job)) });
        return res.json({ 'Message': req.body.ans });
      }
      this.apiReader = new ConfigAPIReader({ path: options?.apiPath, app: options?.app, port: options?.port, endpoint });
      if (!this.apiReader.load()) console.error("Reading config from API was not successful!");
      else {
        this.apiReader?.config?.Hosts?.forEach((host) => this.hosts.push(new K8Host(host)))
        // this.apiReader?.config?.Jobs?.forEach((job) => this.jobs.push(new K8Job(job)))
      }
    } catch (error) {
      console.error("Reading config from file was not successful!");
      console.error(error)
    }
  }
  toJSON() {
    return {
      hosts: this.hosts,
      // jobs: this.jobs,
      file: this.fileReader?.loaded,
      api: this.apiReader?.loaded
    }
  }
}

module.exports = {
  Config
}