//sudo perf stat -e cycles python3 test.py

import { Random } from "random";
import { Task } from "./task";
import { Host } from "./host";
import { TASK_TYPES } from "../types/taskTypes";
import { Scheduler } from "./scheduler";
import { Time } from "./time";
import { } from "../types"
import { FIFOStrategy } from "./strategies/FIFOStrategy";
import { FIFOQueue } from "./queues/FIFOQueue";
import { DuplicationStrategy } from "./strategies/DuplicationStrategy";

export let GLOBAL_TIME = new Time();
const random = new Random();

//////////////////////
const isIt = random.uniformBoolean();
const HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION = random.uniformInt(0, 2);
const MAX_TIME = 50; // ms
const HOSTS = [new Host('1', 16_777_216, 10_000, 3_500_000_000, 1), new Host('2', 16_777_216, 10_000, 3_500_000_000, 2)];
//////////////////////
let lastTaskId = 0;
const strategy = new DuplicationStrategy();
const queue = new FIFOQueue();
const scheduler = new Scheduler(HOSTS, strategy, queue);

function generateRandomTask() {
  const type = random.choice(Object.values(TASK_TYPES));
  if (!type) throw new Error("Task types empty!");
  lastTaskId += 1;
  return new Task(
    lastTaskId.toString(), type.taskType, GLOBAL_TIME.time,
    type.value, type.cpu, type.mem, type.net, type.dist,
    type.sensitive, type.isSoftDeadline, type.deadlineT);
}

function randomTaskArrival() {
  const j = HOW_MANY_TASKS_IN_A_TIMESLOT_FUNCTION();
  const tasks = [];
  for (let i = 0; i < j; i++) {
    let task = generateRandomTask();
    console.log(`New task arrived: ${task.id}, Group: ${task.sensitive ? 'sensitive with deadline ' + task.deadlineTime + ' ms' : 'insensitive'} at time ${GLOBAL_TIME.time}`);
    tasks.push(task);
  }
  return tasks;
}

while (GLOBAL_TIME.time <= MAX_TIME ) { //|| scheduler.queue.size() > 0 || scheduler.isBusyHost()
  if (GLOBAL_TIME.time <= MAX_TIME) randomTaskArrival().forEach(scheduler.addTask.bind(scheduler))
  GLOBAL_TIME.time += 1;
}
