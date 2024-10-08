const { Router } = require("express");

const router = Router();

router.post("", (req, res, next) => {
  const { cpu, mem, net } = req.body;
  if (mem <= process.mem && net <= process.net && !process.busy) {
    process.busy = true;
    // process.cpu -= cpu;
    process.mem -= mem;
    process.net -= net;
    const tic = Date.now();
    return setTimeout(() => {
      process.busy = false;
      // process.cpu += cpu;
      process.mem += mem;
      process.net += net;
      return res.send({ success: true, execTime: Date.now() - tic })
    }, 1000 * cpu / process.cpu);
  } else {
    return res.send({ success: false, message: "Not enough resources!" });
  }
})

module.exports = {
  jobRouter: router
}