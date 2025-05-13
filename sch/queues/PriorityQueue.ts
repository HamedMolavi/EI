import { BaseQueue } from "./Queue";
import { Task } from "../simulation/task";
import { TaskState } from "../cluster/task";

/**
 * Priority Queue implementation
 * Tasks are ordered by their priority (higher priority first)
 */
export class PriorityQueue extends BaseQueue {
  protected tasks: { sensitive: Task[], insensitive: Task[] } = { sensitive: [], insensitive: [] };

  constructor() {
    super("Priority");
  }

  public size(): number {
    return this.tasks.sensitive.length + this.tasks.insensitive.length;
  }

  public isEmpty(): boolean {
    return this.size() === 0;
  }

  public addTask(task: Task): number {
    if (!!task.sensitive) {
      return this.tasks.sensitive.push(task);
    }
    return this.tasks.insensitive.push(task);
  }

  public getTasks(): Task[] {
    return [...this.tasks.sensitive, ...this.tasks.insensitive];
  }


  removeTask() {

  }

  getTask(): Task | undefined {
    return this.tasks.sensitive.shift() || this.tasks.insensitive.shift();
  }

  removeTask(task: Task): void {
    this.tasks = {
      sensitive: this.tasks.sensitive.filter(t => task.id !== t.id),
      insensitive: this.tasks.insensitive.filter(t => task.id !== t.id)
    };
  }

  /**
   * Handle task state changes
   * @param task The task whose state changed
   * @param newState The new state of the task
   */
  handleTaskStateChange(task: Task, newState: TaskState): void {
    if (newState === TaskState.COMPLETED) {
      this.tasks.sensitive = this.tasks.sensitive.filter(t => t !== task);
      this.tasks.insensitive = this.tasks.insensitive.filter(t => t !== task);
    }
  }
} 