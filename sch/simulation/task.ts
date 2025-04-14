import { BaseTask, TaskState } from "../cluster/task";
import { taskEventEmitter } from "./events";
import { GLOBAL_TIME } from ".";

export class Task extends BaseTask {
  deadlineTime!: number;
  startTime?: number;
  completeTime?: number;
  constructor(id: string, type: string, arriveTime: number,
    value: number, cpu: number, mem: number, net: number, distribution: () => number,
    sensitive: boolean = false, isSoftDeadline: boolean = false, deadlineT: number = Infinity,
  ) {
    super(id, type, arriveTime, () => { }, value, cpu, mem, net, distribution, sensitive, isSoftDeadline, deadlineT);
  }

  // Mark task as started
  started(): void {
    this.startTime = GLOBAL_TIME.value;
    this.state = TaskState.STARTED;
    taskEventEmitter.emit({
      type: TaskState.STARTED,
      task: this,
      timestamp: GLOBAL_TIME.value
    });
  }

  // Mark task as completed
  completed(): void {
    this.completeTime = GLOBAL_TIME.value;
    this.state = TaskState.COMPLETED;
    taskEventEmitter.emit({
      type: TaskState.COMPLETED,
      task: this,
      timestamp: GLOBAL_TIME.value
    });
  }

  // Mark task as cancelled
  canceled(): void {
    this.state = TaskState.CANCELLED;
    taskEventEmitter.emit({
      type: TaskState.CANCELLED,
      task: this,
      timestamp: GLOBAL_TIME.value
    });
  }
}