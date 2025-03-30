import { Router } from "express";
import { Task } from "../cluster/task";
import { TASK_TYPES } from "../types/taskTypes";

export const router = Router();

router.post("/", async (req, res) => {
  let results: any[] = [];
  if (process.env["SCH_MODE"]?.toLowerCase() === "offline") {
    results = await Promise.all(
      (req.body['Jobs'] ?? []).map(
        (task: { id: string, taskType: keyof typeof TASK_TYPES }) => new Promise((resolve) => {
          process.conf.jobs.push(new Task(
            //@ts-ignore
            task.id, task.taskType, Date.now(), resolve, ...Object.values(TASK_TYPES[task.taskType])
          ))
        })
      )
    )
  } else {
    results = await Promise.all(
      (req.body['Jobs'] ?? []).map(
        (task: { id: string, taskType: keyof typeof TASK_TYPES }) => new Promise((resolve) => {
          process.conf.hosts[process.conf.hostIndex]?.execute(new Task(
            //@ts-ignore
            task.id, task.taskType, Date.now(), resolve, ...Object.values(TASK_TYPES[task.taskType])
          )).then(resolve);
          process.conf.hostIndex = (process.conf.hostIndex + 1) % process.conf.hosts.length;
        })
      )
    )
  }
  res.json({ 'Message': "jobs executed", data: results });
  return;
})
