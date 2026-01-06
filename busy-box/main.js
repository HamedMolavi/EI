const express = require('express');
const ip = require("ip");
const envConfigs = require('./config/env');
const { mainRouter } = require('./routes');
envConfigs();


const app = express();
const ipAddress = ip.address();
const ipPort = parseInt(process.env['PORT'] ?? "3000");

app.use(express.json({
  inflate: true,
  limit: '100kb',
  reviver: null,
  strict: true,
  type: 'application/json',
  verify: undefined
}))

app.use(mainRouter);

app.listen(ipPort, console.log(`Listening to ${ipAddress}:${ipPort} !!!`))