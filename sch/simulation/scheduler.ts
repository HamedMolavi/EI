import { GLOBAL_TIME } from ".";
import { BaseScheduler } from "../cluster/scheduler";
import { Host } from "./host";
import { Task } from "./task";
import { BaseStrategy } from "./strategies/strategy";
import { FIFOStrategy } from "./strategies/FIFOStrategy";
import { taskEventEmitter, TaskEvent } from "./events";
import { TaskState } from "../cluster/task";
import { Queue } from "../queues/Queue";
import { FIFOQueue } from "./queues/FIFOQueue";
const TIME_SLOT = 10; // ms

export class Scheduler extends BaseScheduler {
  hosts!: Host[]

  constructor(hosts: Host[], strategy: BaseStrategy = new FIFOStrategy(), queue: Queue = new FIFOQueue()) {
    super(hosts, strategy, queue);
    GLOBAL_TIME.onChange(time => {
      this.updateRewards();
      this.queue.dropPassedDeadline();
      if (time % TIME_SLOT === 0) this.dispatch();
    })

    // Listen for task events
    for (const event of Object.values(TaskState)) {
      taskEventEmitter.on(event, this.handleTaskEvent.bind(this));
    }
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
    console.log("Mapping", mappings)
    // Process mappings if any
    if (mappings) {
      for (const { task, host } of mappings) {
        // Dispatch the task
        host.execute(task);
      }
    }
    this.evaluateSystemLoad();
  }

  // Handle task completion events
  private handleTaskEvent(event: TaskEvent): void {
    // Let the strategy handle task completion if needed
    if (this.strategy.handleTaskStateChange) {
      this.strategy.handleTaskStateChange(event.task, event.type);
    }
    // Let the queue handle task completion if needed
    if (this.queue.handleTaskStateChange) {
      this.queue.handleTaskStateChange(event.task, event.type);
    }
  }

}
