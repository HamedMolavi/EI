import { BaseStrategy } from "./strategy";
import { Task } from "../task";
import { Host } from "../host";
import { GLOBAL_TIME } from "..";

export class DuplicationStrategy extends BaseStrategy {
  private duplicationCount: number;
  private dispatchedTasks: { [key: string]: Task[] };

  constructor(duplicationCount: number = 2) {
    super('Duplication');
    this.duplicationCount = duplicationCount;
    this.dispatchedTasks = {};
  }

  selectTaskHostMapping(sensitiveTasks: Task[], insensitiveTasks: Task[], availableHosts: Host[]): { task: Task, host: Host }[] | null {
    let task: Task | null = null;
    // First check sensitive tasks
    if (sensitiveTasks.length > 0) {
      task = sensitiveTasks[0];
    }
    // Then check insensitive tasks
    if (insensitiveTasks.length > 0) {
      task = insensitiveTasks[0];
    }
    if (!task) return null;
    const duplicates = Array(Math.min(this.duplicationCount, availableHosts.length)).fill(0).map((_, i) => this.duplicateTask(task));
    if (!this.dispatchedTasks[task.id]) {
      this.dispatchedTasks[task.id] = [];
    };
    this.dispatchedTasks[task.id].push(...duplicates, task);
    return duplicates.map((duplicate, i) => ({ task: duplicate, host: availableHosts[i] }));
  }

  shouldDispatch(sensitiveTasks: Task[], insensitiveTasks: Task[]): boolean {
    // Always dispatch if there are tasks available
    return sensitiveTasks.length > 0 || insensitiveTasks.length > 0;
  }

  /**
   * Creates duplicates of a task
   * @param task The task to duplicate
   * @returns duplicated task
   */
  private duplicateTask(task: Task): Task {
    const duplicate = new Task(
      `backup-${task.id}`,
      task.type,
      GLOBAL_TIME.time,
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

  /**
   * Handles task completion
   * @param task The completed task
   */
  handleTaskCompletion(task: Task): void {
    const originalTaskId = task.id.replace('backup-', '');
    if (this.dispatchedTasks[originalTaskId]) {
      const tasksToBeCancelled = this.dispatchedTasks[originalTaskId].filter(t => t.id !== task.id);
      tasksToBeCancelled.forEach(task => {
        task.canceled();
      });
      this.dispatchedTasks[originalTaskId] = [];
    }
  }

  /**
   * Sets the number of duplicates to create for each task
   * @param count Number of duplicates
   */
  setDuplicationCount(count: number): void {
    this.duplicationCount = count;
  }
} 