import { Random } from "random";
import { BaseHost, Host } from "./host";
import { BaseTask, Task } from "./task";
import { showTime } from "../utils/time";
const random = new Random();
export abstract class BaseScheduler {
  queueSensitive!: BaseTask[];
  queueInsensitive!: BaseTask[];
  reward!: number;
  penalty!: number;
  abstract dispatch(...args: any[]): void
  abstract resorte(...args: any[]): void
  abstract isBusyHost(...args: any[]): boolean

  constructor(public hosts: BaseHost[]) {
    this.init();
  }
  init() {
    this.queueSensitive = [];
    this.queueInsensitive = [];
    this.reward = 0;
    this.penalty = 0;
  }

  addTask(task: BaseTask) {
    if (task.sensitive) {
      this.queueSensitive.push(task);
    } else {
      this.queueInsensitive.push(task);
    }
  }

  selectTask() {
    if (this.queueSensitive.length > 0) {
      return this.queueSensitive.shift();
    } else if (this.queueInsensitive.length > 0) {
      return this.queueInsensitive.shift();
    }
    return;
  }

  evaluateSystemLoad() {
    let load = this.queueSensitive.length + this.queueInsensitive.length;
    let label = load > 5 ? "High Load" : "Normal Load";
    // console.log(`Current Reward: ${this.reward}, Current Penalty: ${this.penalty}`);
    // console.log(`System Load: ${label}`);
  }

}
export class Scheduler extends BaseScheduler {
  hosts!: Host[]
  queueSensitive!: Task[];
  queueInsensitive!: Task[];
  dispatching: boolean;
  constructor(hosts: Host[]) {
    super(hosts);
    this.dispatching = false;
  }
  isBusyHost(): boolean {
    return this.hosts.some(host => host.isBusy());
  }

  updateRewards() {
    const { reward, penalty } =
      this.hosts.reduce((res, cur) => { res['reward'] += cur['reward']; res['penalty'] += cur['penalty']; return res; }, { reward: 0, penalty: 0 });
    this.reward = reward;
    this.penalty = penalty;
  }

  async dispatch() {
    if (this.dispatching) return;
    this.dispatching = true;
    while (true) {
      let task = this.selectTask();
      let host = random.choice(this.hosts);
      if (!task || !host) break;
      console.log(`Dispatching Task: ${task.id}, time ${showTime(Date.now())}`);
      await (new Promise((res) => setTimeout(res, host?.transmissionDelay ?? 0)));
      host.execute(task);
      task.startTime = Date.now();
    }
    this.evaluateSystemLoad();
    this.dispatching = false;
  }

  resorte() {

  }

}
