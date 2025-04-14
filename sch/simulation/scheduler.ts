import { GLOBAL_TIME } from ".";
import { BaseScheduler } from "../cluster/scheduler";
import { Host } from "./host";
import { Task } from "./task";
import { BaseStrategy } from "./strategies/strategy";
import { FIFOStrategy } from "./strategies/FIFOStrategy";
import { taskEventEmitter, TaskEvent } from "./events";
import { TaskState } from "../cluster/task";
import { Queue } from "../queues/Queue";
import { FIFOQueue } from "../queues/FIFOQueue";

export class Scheduler extends BaseScheduler {
  hosts!: Host[]

  constructor(hosts: Host[], strategy: BaseStrategy = new FIFOStrategy(), queue: Queue = new FIFOQueue()) {
    super(hosts, strategy, queue);
    
    // Listen for task completion events
    taskEventEmitter.on(TaskState.COMPLETED, this.handleTaskCompletion.bind(this));
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
    if (!this.strategy.shouldDispatch(this.queue)) {
      return;
    }
    // Get task-host mappings from strategy
    const mappings = this.strategy.selectTaskHostMappings(this.queue, this.hosts);
    
    // Process mappings if any
    if (mappings) {
      for (const { task, host } of mappings) {
        // Remove task from appropriate queue
        this.queue.removeTask(task);
        // Dispatch the task
        host.execute(task);
      }
    }
    this.evaluateSystemLoad();
  }

  // Handle task completion events
  private handleTaskCompletion(event: TaskEvent): void {
    // Let the strategy handle task completion if needed
    if (this.strategy.handleTaskCompletion) {
      this.strategy.handleTaskCompletion(event.task);
    }
  }

}
