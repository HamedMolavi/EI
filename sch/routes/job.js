const { Router } = require("express");
const { K8Job } = require("../cluster/job");

const router = Router();

router.post("/", async (req, res, next) => {
  let results = [];
  if (process.env["SCH_MODE"]?.toLowerCase() === "offline") {
    results = await Promise.all(
      (req.body['Jobs'] ?? []).map(
        jobObject => new Promise((resolve) => {
          process.conf.jobs.push(new K8Job({ ...jobObject, emit: resolve }))

        })
      )
    )
  } else {
    results = await Promise.all(
      (req.body['Jobs'] ?? []).map(
        jobObject => new Promise((resolve) => {
          process.conf.hosts[process.conf.hostIndex]?.execute(new K8Job(jobObject)).then(resolve);
          process.conf.hostIndex = (process.conf.hostIndex + 1) % process.conf.hosts.length;
        })
      )
    )
  }
  return res.json({ 'Message': "jobs executed", data: results });
})

module.exports = {
  jobRouter: router
}