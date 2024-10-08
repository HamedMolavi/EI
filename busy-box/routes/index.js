const { Router } = require("express");
const { jobRouter } = require("./job");

const router = Router();

router.use("/job", jobRouter);

module.exports = {
  mainRouter: router
}