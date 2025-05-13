import { BaseQueue } from "./Queue";
import { Task } from "../cluster/task";
import { TaskState } from "../cluster/task";

/**
 * First-In-First-Out Queue implementation
 */
export class FIFOQueue extends BaseQueue {
  protected tasks: Task[] = [];

  constructor() {
    super("FIFO");
    this.tasks = [];
  }

  /**
   * Get the number of tasks currently in the queue
   * @returns The number of tasks in the queue
   */
  size(): number {
    return this.tasks.length;
  }

  addTask(task: Task): number {
    return this.tasks.push(task);
  }

  getTasks(): Task[] {
    return [...this.tasks];
  }

  isEmpty(): boolean {
    return this.tasks.length === 0;
  }

  getTask(): Task | undefined {
    return this.tasks[0];
  }

  popTask(): Task | undefined {
    return this.tasks.shift();
  }

  removeTask(task: Task): void {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
  }

  handleTaskStateChange(task: Task, newState: TaskState): void {
    if (newState === TaskState.COMPLETED) {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
    }
  }
} 