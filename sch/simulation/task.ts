import { BaseTask, TaskState } from "../cluster/task";
import { taskEventEmitter } from "../events/task";
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
    if (this.state === TaskState.STARTED) return; // already started
    this.startTime = GLOBAL_TIME.time;
    this.state = TaskState.STARTED;
    taskEventEmitter.emit({
      type: TaskState.STARTED,
      task: this,
      timestamp: GLOBAL_TIME.time
    });
  }

  // Mark task as completed
  completed(): void {
    if (this.state === TaskState.COMPLETED) return; // already completed
    this.completeTime = GLOBAL_TIME.time;
    this.state = TaskState.COMPLETED;
    taskEventEmitter.emit({
      type: TaskState.COMPLETED,
      task: this,
      timestamp: GLOBAL_TIME.time
    });
  }

  // Mark task as cancelled
  canceled(): void {
    if (this.state === TaskState.CANCELLED) return; // already canceled
    this.state = TaskState.CANCELLED;
    taskEventEmitter.emit({
      type: TaskState.CANCELLED,
      task: this,
      timestamp: GLOBAL_TIME.time
    });
  }
}