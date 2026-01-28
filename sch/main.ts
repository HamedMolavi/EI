import { } from "./types/index";
import { Config } from "./config";
import express from 'express';
import ip from 'ip';
import { router as taskRouter } from "./routes/task";
import { envConfigs } from "./config/env";
import { Scheduler } from "./cluster/scheduler";
import { showTime } from "./utils/time";
envConfigs();

const app = express();
app.use(express.json({ inflate: true, limit: '100kb', strict: true, type: 'application/json', verify: undefined }));
process.conf = new Config({ app, });

const ipAddress = process.env.IP ?? ip.address();
const ipPort = 3000;
const scheduler = new Scheduler(process.conf.hosts);
setInterval(() => {
  scheduler.dispatch();
}, parseInt(process.env.TIME_SLOT ?? "10"));


if (!!process.conf) {
  process.conf.tasks.splice(0).forEach(task => {
    setTimeout(() => {
      task.arriveTime = Date.now();
      console.log(`New task arrived: ${task.id}, Group: ${task.sensitive ? 'sensitive with deadline ' + task.deadlineTime + ' ms' : 'insensitive'} at time ${showTime(task.arriveTime)}`);
      scheduler.addTask(task);
    }, task.arriveTime);

  })
}

app.use("/task", taskRouter);


app.listen(ipPort, () => {
  console.log(`Listening to ${ipAddress}:${ipPort} !!!`);
  // console.log(process.conf.toJSON())
})