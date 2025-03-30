import { BaseHost } from "./host";
import { BaseTask } from "./task";

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
    return null;
  }

  evaluateSystemLoad() {
    let load = this.queueSensitive.length + this.queueInsensitive.length;
    let label = load > 5 ? "High Load" : "Normal Load";
    console.log(`Current Reward: ${this.reward}, Current Penalty: ${this.penalty}`);
    console.log(`System Load: ${label}`);
  }

}
