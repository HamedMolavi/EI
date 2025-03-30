import { Task } from "./task";
import { Evented } from "../utils/queue";

export class Host {
  context: Context;
  constructor(
    public id: number,
    public cpu: number,
    public mem: number,
    public net: number,
    public transmissionDelay: number,
    public ip: number,
  ) {
    this.context = new Context(this);
  }

  execute(task: Task) {
    return new Promise((res) => {
      const id = task.id;
      if (!!task.emit?.call) this.context.on(`finish${id}`, task.emit);
      this.context.on(`finish${id}`, res);
      this.context.set(task);
    })
  }

  toJSON() {
    return (
      {
        'id': this.id,
        'ip': this.ip,
        'cpu': this.cpu,
        'mem': this.mem,
        'net': this.net
      }
    )
  }
}



class Context extends Evented {
  ctx: Task[];
  constructor(public host: Host) {
    super();
    this.ctx = [];
    this.loop();
  }

  set(task: Task) {
    this.ctx.push(task);
    this._triggerEvent("set", task);
    this._triggerEvent(`set${task.id}`, task);
    return true;
  }

  async loop() {
    while (true) {
      const task = this.ctx.shift();
      if (!!task) {
        await new Promise((res) => {
          // execute task
          setTimeout(() => {
            let result = { ...task.toJSON(), time: 1000 * task.cpu / this.host.cpu };
            this._triggerEvent("finish", result);
            this._triggerEvent(`finish${task.id}`, result);
            res(result);
          }, 1000 * task.cpu / this.host.cpu);
        })
      }
      await new Promise((res) => setTimeout(res, 100));
    }
  }
}



// class Host {
//   constructor(id, mem, net, cpu, transmissionDelay) {
//       this.id = id;
//       this.mem = mem; this.net = net; this.cpu = cpu;
//       this.transmissionDelay = transmissionDelay;
//       this.currentTask = null;
//       this.taskReceivedTime = null;
//       this.taskCompleteTime = +Infinity;
//       this.reward = 0;
//       this.penalty = 0;
//   }

//   receiveTask(task) {
//       this.currentTask = task;
//       this.taskReceivedTime = time;
//       const expectedCpuUsage = task.cpuDistribution();
//       console.log(expectedCpuUsage)
//       const expectedExecutionT = (expectedCpuUsage / this.cpu) * 1000; //ms
//       this.taskCompleteTime = time + this.transmissionDelay + expectedExecutionT;
//       console.log(`Host ${this.id}: Received task ${task.id}, complete expctation at ${this.taskCompleteTime}`);
//   }

//   checkCompleted() {
//       let task = this.currentTask;
//       let r;
//       if (!!task) {
//           if (time >= this.taskCompleteTime) {
//               task.completeTime = this.taskCompleteTime;
//               if (task.sensitive) {
//                   r = REWARDS[`${task.isSoftDeadline ? 'soft' : 'hard'}-sensitive-${time >= task.deadlineTime ? 'violate' : 'complete'}`](task);
//                   if (r > 0) this.reward += r;
//                   else this.penalty += r;
//               } else {
//                   r = REWARDS['insensitive'](task);
//                   this.reward += r;
//               }
//               console.log(`Host ${this.id}: Completed task ${task.id} at time ${time}`);
//               this.currentTask = null;
//           } else if (task.sensitive && !task.isSoftDeadline && time >= task.deadlineTime) {
//               console.log(`Host ${this.id}: Abort task ${task.id}, now ${time} - deadline ${task.deadlineTime}`);
//               this.currentTask = null;
//               r = REWARDS['hard-sensitive-violate'](task);
//               this.penalty += r;
//           }
//       }
//       return r;
//   }
// }