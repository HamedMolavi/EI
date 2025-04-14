import { BaseStrategy } from "./strategy";
import { Task } from "../task";
import { Host } from "../host";
import { Queue } from "../../queues/Queue";
export class FIFOStrategy extends BaseStrategy {
  constructor() {
    super('FIFO');
  }
  selectTaskHostMappings(queue: Queue, hosts: Host[]): { task: Task, host: Host }[] | null {
    let freeHosts = hosts.filter(h => !h.currentTask);
    let task = queue.getTask();
    if (task && freeHosts.length > 0) {
      return [{ task: task, host: freeHosts[0] }];
    }
    return null;
  }

  shouldDispatch(queue: Queue): boolean {
    return queue.size() > 0;
  }

  handleTaskCompletion(task: Task): void {
    // Send results back to User
  }
}