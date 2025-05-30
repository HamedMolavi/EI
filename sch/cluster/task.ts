export enum TaskState {
  PENDING = 'pending',
  STARTED = 'started',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}


export abstract class BaseTask {
  startTime?: number;
  completeTime?: number;
  deadlineTime: number;
  state: TaskState;
  constructor(
    public id: string,
    public type: string,
    public arriveTime: number,
    public emit: (value: unknown) => void,
    // From type
    public value: number,
    public cpu: number,
    public mem: number,
    public net: number,
    public distribution: () => number,
    public sensitive: boolean = false,
    public isSoftDeadline: boolean = false,
    deadlineT: number = Infinity,
  ) {
    this.deadlineTime = sensitive ? arriveTime + deadlineT : Infinity;
    this.startTime = undefined;
    this.completeTime = undefined;
    this.state = TaskState.PENDING;
  }
  toJSON() { return ({ 'state': this.state, 'id': this.id, 'type': this.type, 'value': this.value, 'cpu': this.cpu, 'mem': this.mem, 'net': this.net }) }
  started() {
    this.state = TaskState.STARTED;
  }
  completed() {
    this.state = TaskState.COMPLETED;
  }
  canceled() {
    this.state = TaskState.CANCELLED;
  }
}


export class Task extends BaseTask {
  startTime?: number;
  completeTime?: number;
  deadlineTime!: number;
  constructor(id: string, type: string, arriveTime: number, emit: (value: unknown) => void,
    value: number, cpu: number, mem: number, net: number, distribution: () => number,
    sensitive: boolean = false, isSoftDeadline: boolean = false, deadlineT: number = Infinity,
  ) {
    super(id, type, arriveTime, emit, value, cpu, mem, net, distribution, sensitive, isSoftDeadline, deadlineT);
  }
}
