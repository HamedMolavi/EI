import { GLOBAL_TIME } from ".";
import { BaseScheduler } from "../cluster/scheduler";
import { Host } from "./host";
import { Task } from "./task";
import { taskEventEmitter, TaskEvent } from "../events/task";
import { TaskState } from "../cluster/task";
import { BaseQueue } from "../queues/Queue";
import { FIFOQueue } from "../queues/FIFOQueue";
import { BaseStrategy } from "../strategies/strategy";
import { FIFOStrategy } from "../strategies/FIFOStrategy";

export class Scheduler extends BaseScheduler {
  hosts!: Host[]

  constructor(hosts: Host[], strategy: BaseStrategy = new FIFOStrategy(), queue: BaseQueue = new FIFOQueue()) {
    super(hosts, strategy, queue);

    // Listen for task completion events
    taskEventEmitter.on(TaskState.COMPLETED, this.handleTaskCompletion.bind(this));
    taskEventEmitter.on(TaskState.CANCELLED, this.handleTaskCancelation.bind(this));
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
    if (!this.strategy.shouldDispatch(this.queue)) return;
    // Get task-host mappings from strategy
    const mappings = this.strategy.selectTaskHostMappings(this.queue, this.hosts);

    // Process mappings if any
    if (mappings) {
      for (const { task, host } of mappings) {
        // Dispatch the task
        host.execute(task);
        // Remove task from appropriate queue
        this.queue.removeTask(task);
      }
    }
    this.evaluateSystemLoad();
  }

  // Handle task completion events
  handleTaskCompletion(event: TaskEvent): void {
    // Let the strategy handle task completion if needed
    if (this.strategy.handleTaskCompletion) {
      this.strategy.handleTaskCompletion(event.task);
    }
  }

  handleTaskCancelation(event: TaskEvent): void {
    // Let the strategy handle task completion if needed
    if (this.strategy.handleTaskCancelation) {
      this.strategy.handleTaskCancelation(event.task);
    }
  }
}
