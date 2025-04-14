import { Queue } from "./Queue";
import { Task } from "../simulation/task";
import { TaskState } from "../cluster/task";

/**
 * First-In-First-Out Queue implementation
 */
export class FIFOQueue extends Queue {
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

  /**
   * Add a new task to the end of the queue
   * @param task The task to be added
   * @returns The new length of the queue after adding the task
   */
  addTask(task: Task): number {
    return this.tasks.push(task);
  }

  /**
   * Get a copy of all tasks currently in the queue
   * @returns Array containing all tasks in the queue
   */
  getTasks(): Task[] {
    return [...this.tasks];
  }

  /**
   * Check if the queue contains any tasks
   * @returns true if the queue is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.tasks.length === 0;
  }


  /**
   * Get the next task to be processed (first task in the queue)
   * @returns The next task or undefined if the queue is empty
   */
  getTask(): Task | undefined {
    return this.tasks[this.tasks.length - 1];
  }

  removeTask(task: Task): void {
    this.tasks = this.tasks.filter(t => t.id !== task.id);
  }

  /**
   * Handle task state changes
   * @param task The task whose state changed
   * @param newState The new state of the task
   */
  handleTaskStateChange(task: Task, newState: TaskState): void {
    if (newState === TaskState.COMPLETED) {
      this.tasks = this.tasks.filter(t => t.id !== task.id);
    }
  }
} 