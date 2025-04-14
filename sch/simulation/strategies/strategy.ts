import { Task } from "../task";
import { Host } from "../host";
import { Queue } from "../../queues/Queue";

export abstract class BaseStrategy {
  abstract handleTaskCompletion(task: Task): void;

  constructor(public name: string) {

  }

  /**
   * Selects the next task to be executed from the available tasks
   * Selects the best host for a given task
   * @param queue Queue of tasks
   * @param hosts List of available hosts
   * @returns The Array of selected {task: Task, host: Host} or null if no task should be selected
   */
  selectTaskHostMappings(queue: Queue, hosts: Host[]): { task: Task, host: Host }[] | null {
    // TODO: Selected host shouldn't appear in hosts for next selection
    return null;
  };

  /**
   * Determines if tasks should be dispatched at the current time
   * @param sensitiveTasks Queue of sensitive tasks
   * @param insensitiveTasks Queue of insensitive tasks
   * @returns true if tasks should be dispatched, false otherwise
   */
  shouldDispatch(queue: Queue): boolean {
    return false;
  };

} 