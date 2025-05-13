import { BaseStrategy } from "./strategy";
import { Task } from "../task";
import { Host } from "../host";
import { GLOBAL_TIME } from "..";
import { Queue } from "../../queues/Queue";
import { TaskState } from "../../cluster/task";

export class DuplicationStrategy extends BaseStrategy {
  private duplicationCount: number;
  private dispatchedTasks: { [key: string]: Task[] };

  constructor(duplicationCount: number = 2) {
    super('Duplication');
    this.duplicationCount = duplicationCount;
    this.dispatchedTasks = {};
  }

  selectTaskHostMappings(queue: Queue, hosts: Host[]): { task: Task, host: Host }[] | null {
    let freeHosts = hosts.filter(h => !h.currentTask);
    console.log(freeHosts)
    if (!freeHosts.length) return null;
    let task = queue.getTask();
    console.log(task)
    if (!task) return null;

    const duplicates = Array(Math.min(this.duplicationCount, freeHosts.length - 1)).fill(task)
      .map(t => this.duplicateTask(t));
    if (!this.dispatchedTasks[task.id]) this.dispatchedTasks[task.id] = [];

    this.dispatchedTasks[task.id].push(...duplicates, task);
    return this.dispatchedTasks[task.id].map((task, i) => ({ task, host: freeHosts[i] }));
  }

  shouldDispatch(queue: Queue): boolean {
    // Always dispatch if there are tasks available
    return queue.size() > 0;
  }

  private duplicateTask(task: Task): Task {
    const duplicate = new Task(
      `backup-${crypto.randomUUID().slice(0, 3)}-${task.id}`,
      task.type,
      task.arriveTime,
      task.value,
      task.cpu,
      task.mem,
      task.net,
      task.distribution,
      task.sensitive,
      task.isSoftDeadline,
      task.deadlineTime,
    );
    return duplicate;
  }

  handleTaskStateChange(task: Task, newState: TaskState): void {
    if (newState === TaskState.COMPLETED) {
      const originalTaskId = task.id.replace(/backup-...-/, '');
      if (this.dispatchedTasks[originalTaskId]) {
        const tasksToBeCancelled = this.dispatchedTasks[originalTaskId].filter(t => t.id !== task.id);
        tasksToBeCancelled.forEach(task => {
          task.canceled();
        });
        this.dispatchedTasks[originalTaskId] = [];
      }
    }
  }

  setDuplicationCount(count: number): void {
    this.duplicationCount = count;
  }
} 