import { BaseHost } from "../cluster/host";
import { BaseTask } from "../cluster/task";
import { BaseQueue } from "../queues/Queue";

export abstract class BaseStrategy {
  abstract handleTaskCompletion(task: BaseTask): void;
  abstract handleTaskCancelation(task: BaseTask): void;

  constructor(public name: string) {

  }

  /**
   * Selects the next task to be executed from the available tasks
   * Selects the best host for a given task
   * @param queue BaseQueue of tasks
   * @param hosts List of available hosts
   * @returns The Array of selected {task: BaseTask, host: BaseHost} or null if no task should be selected
   */
  selectTaskHostMappings(queue: BaseQueue, hosts: BaseHost[]): { task: BaseTask, host: BaseHost }[] | null {
    // TODO: Selected host shouldn't appear in hosts for next selection
    return null;
  };

  /**
   * Determines if tasks should be dispatched at the current time
   * @param queue BaseQueue of tasks
   * @returns true if tasks should be dispatched, false otherwise
   */
  shouldDispatch(queue: BaseQueue): boolean {
    return false;
  };

} 