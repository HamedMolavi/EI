import { GLOBAL_TIME } from ".";
import { BaseHost } from "../cluster/host";
import { REWARDS } from "../types/taskTypes";
import { Task } from "./task";
import { TaskState } from "../cluster/task";

export class Host extends BaseHost {
  currentTask: undefined | Task;
  taskReceivedTime: undefined | number;
  taskCompleteTime!: number;
  reward!: number;
  penalty!: number;
  constructor(id: string, mem: number, net: number, cpu: number, transmissionDelay: number) {
    super(id, mem, net, cpu, transmissionDelay, '0.0.0.0');
  }

  init() {
    this.currentTask = undefined;
    this.taskReceivedTime = undefined;
    this.taskCompleteTime = +Infinity;
    this.reward = 0;
    this.penalty = 0;
    GLOBAL_TIME.onChange(this.checkCompleted.bind(this));
  }

  isBusy(): boolean {
    return !!this.currentTask;
  }

  execute(task: Task) {
    this.currentTask = task;
    this.taskReceivedTime = GLOBAL_TIME.time;
    const expectedCpuUsage = task.distribution();
    const expectedExecutionT = (expectedCpuUsage / this.cpu) * 1000; //ms
    this.taskCompleteTime = GLOBAL_TIME.time + this.transmissionDelay + expectedExecutionT;
    console.log(`Host ${this.id}: Received task ${task.id}, complete expctation at ${this.taskCompleteTime}, deadline at ${task.deadlineTime}`);

    // Mark task as started
    task.started();

    // const p = new Promise((res) => {
    //   GLOBAL_TIME.onChange(this.checkCompleted.bind(this))
    // });
    // return p;
  }

  checkCompleted() {
    let task = this.currentTask;
    let r;
    if (!!task) {
      if (task.state === TaskState.CANCELLED) {
        task.canceled();
        console.log(`Host ${this.id}: Task ${task.id} was cancelled`);
        this.currentTask = undefined;
        return;
      }

      if (GLOBAL_TIME.time >= this.taskCompleteTime) {
        task.completed();
        if (task.sensitive) {
          r = REWARDS[`${task.isSoftDeadline ? 'soft' : 'hard'}-sensitive-${GLOBAL_TIME.time >= task.deadlineTime ? 'violate' : 'complete'}`](task);
          if (r > 0) this.reward += r;
          else this.penalty += r;
        } else {
          r = REWARDS['insensitive'](task);
          this.reward += r;
        }
        console.log(`Host ${this.id}: Completed task ${task.id} at time ${GLOBAL_TIME.time}`);
        this.currentTask = undefined;
      } else if (task.sensitive && !task.isSoftDeadline && GLOBAL_TIME.time >= task.deadlineTime) {
        task.canceled();
        console.log(`Host ${this.id}: Abort task ${task.id}, now ${GLOBAL_TIME.time} - deadline ${task.deadlineTime}`);
        this.currentTask = undefined;
        r = REWARDS['hard-sensitive-violate'](task);
        this.penalty += r;
        task.canceled();
      }
    }
    return r;
  }
}

