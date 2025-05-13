import { Random } from "random";
import { BaseHost, Host } from "./host";
import { BaseTask, Task, TaskState } from "./task";
import { showTime } from "../utils/time";
import { BaseStrategy } from "../strategies/strategy";
import { BaseQueue } from "../queues/Queue";
import { TaskEvent } from "../events/task";
const random = new Random();
export abstract class BaseScheduler {
  reward!: number;
  penalty!: number;
  abstract dispatch(...args: any[]): void;
  abstract isBusyHost(...args: any[]): boolean;
  abstract handleTaskCompletion(event: TaskEvent & { type: TaskState.COMPLETED }): void;
  abstract handleTaskCancelation(event: TaskEvent & { type: TaskState.CANCELLED }): void;

  constructor(public hosts: BaseHost[], public strategy: BaseStrategy, public queue: BaseQueue) {
    this.init();
  }
  init() {
    this.reward = 0;
    this.penalty = 0;
  }

  addTask(task: BaseTask) {
    this.queue.addTask(task);
  }


  evaluateSystemLoad() {
    let load = this.queue.size();
    let label = load > 5 ? "High Load" : "Normal Load";
    return label;
    console.log(`Current Reward: ${this.reward}, Current Penalty: ${this.penalty}`);
    console.log(`System Load: ${label}`);
  }

  setStrategy(strategy: BaseStrategy) {
    this.strategy = strategy;
  }
}
//////////////////////////////////////////////////////////////////////
export class Scheduler extends BaseScheduler {
  hosts!: Host[]
  dispatching: boolean;
  constructor(hosts: Host[], strategy: BaseStrategy, queue: BaseQueue) {
    super(hosts, strategy, queue);
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
      let task = this.queue.getTask();
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

  handleTaskCancelation(event: TaskEvent & { type: TaskState.CANCELLED; }): void {

  }
  handleTaskCompletion(event: TaskEvent & { type: TaskState.COMPLETED; }): void {

  }
}
