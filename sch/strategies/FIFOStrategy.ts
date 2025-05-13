import { BaseHost } from "../cluster/host";
import { BaseTask } from "../cluster/task";
import { FIFOQueue } from "../queues/FIFOQueue";
import { BaseStrategy } from "./strategy";

export class FIFOStrategy extends BaseStrategy {
  constructor() {
    super('FIFO');
  }

  selectTaskHostMappings(queue: FIFOQueue, hosts: BaseHost[]): { task: BaseTask, host: BaseHost }[] | null {
    let freeHost = hosts.filter(h => !h.isBusy())[0];
    let task = queue.getTask();
    if (!!task && !!freeHost) {
      return [{ task: task, host: freeHost }];
    }
    return null;
  }

  shouldDispatch(queue: FIFOQueue): boolean {
    return queue.size() > 0;
  }

  handleTaskCompletion(task: BaseTask): void {
    // Send results back to User
  }
  handleTaskCancelation(task: BaseTask): void {
    // Send results back to User
  }
}