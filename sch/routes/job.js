const { Router } = require("express");
const { K8Job } = require("../cluster/job");

const router = Router();

let hostIndex = 0;
router.post("/", async (req, res, next) => {
  // req.body['Jobs']?.forEach(job => { process.conf.jobs.push(new K8Job(job)) });

  let results = await Promise.all(
    (req.body['Jobs'] ?? []).map(
      jobObject => new Promise((resolve) => {
        process.conf.hosts[hostIndex]?.execute(new K8Job(jobObject)).then(resolve);
        hostIndex = (hostIndex + 1) % process.conf.hosts.length;
      })
    )
  )

  return res.json({ 'Message': "jobs executed", data: results });
})

module.exports = {
  jobRouter: router
}