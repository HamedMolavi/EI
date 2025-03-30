import { Task } from "./task";
import { Evented } from "../utils/queue";

export abstract class BaseHost {
  abstract init(): void;
  abstract execute(task: Task, ...args: any[]): void;

  constructor(public id: string, public mem: number, public net: number, public cpu: number, public transmissionDelay: number, public ip: string) {
    this.init();
  }

  toJSON() { return ({ 'id': this.id, 'ip': this.ip, 'cpu': this.cpu, 'mem': this.mem, 'net': this.net }) }

}


export class Host extends BaseHost {
  context!: Context;
  constructor(id: string, cpu: number, mem: number, net: number, transmissionDelay: number, ip: string,
  ) {
    super(id, cpu, mem, net, transmissionDelay, ip);
  }
  init() {
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
