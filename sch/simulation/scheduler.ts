import { GLOBAL_TIME } from ".";
import { BaseScheduler } from "../cluster/scheduler";
import { Host } from "./host";
import { Task } from "./task";

export class Scheduler extends BaseScheduler {
  hosts!: Host[]
  queueSensitive!: Task[];
  queueInsensitive!: Task[];
  constructor(hosts: Host[]) {
    super(hosts);
  }
  isBusyHost(): boolean {
    return this.hosts.some(host => !!host.currentTask);
  }

  updateRewards() {
    const { reward, penalty } =
      this.hosts.reduce((res, cur) => { res['reward'] += cur['reward']; res['penalty'] += cur['penalty']; return res; }, { reward: 0, penalty: 0 });
    this.reward = reward;
    this.penalty = penalty;
  }

  dispatch() {
    let freeHosts = this.hosts.filter(h => !h.currentTask);
    while (freeHosts.length > 0) {
      let task = this.selectTask();
      let host = freeHosts.shift();
      if (!task || !host) break;
      host.execute(task);
      task.startTime = GLOBAL_TIME.value;
    }
    this.evaluateSystemLoad();
  }

  resorte() {

  }

}
