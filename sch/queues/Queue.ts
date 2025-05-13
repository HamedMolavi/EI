import { Task } from "../simulation/task";
import { TaskState } from "../cluster/task";

/**
 * Base Queue class that provides common functionality for all queue types
 */
export abstract class Queue {
  constructor(protected name: string) {
  }

  protected tasks!: any;

  /**
   * Get the number of tasks in the queue
   * @returns Number of tasks
   */
  abstract size(): number;

  /**
   * Add a task to the queue
   * @param task The task to add
   */
  abstract addTask(task: Task): number;

  /**
   * Get a task from the queue
   * @returns The task or undefined if the queue is empty
   */
  abstract getTask(): Task | undefined;

  /**
   * Get all tasks in the queue
   * @returns Array of tasks
   */
  abstract getTasks(): Task[];

  /**
   * Remove a task from the queue
   * @param task The task to remove
   */
  abstract removeTask(task: Task): void;

  /**
   * Check if the queue is empty
   * @returns true if the queue is empty, false otherwise
   */
  abstract isEmpty(): boolean;

  /**
   * Handle task state changes
   * @param task The task whose state changed
   * @param newState The new state of the task
   */
  handleTaskStateChange(task: Task, newState: TaskState): void {
    if ([TaskState.COMPLETED, TaskState.CANCELLED].includes(newState)) {
      this.removeTask(task);
    }
  }
  
  abstract dropPassedDeadline(): void;
} 