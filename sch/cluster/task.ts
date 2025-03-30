

export class Task {
  startTime?: number;
  completeTime?: number;
  deadlineTime: number;
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
  }
  toJSON() {
    return (
      {
        'id': this.id,
        'type': this.type,
        'value': this.value,
        'cpu': this.cpu,
        'mem': this.mem,
        'net': this.net
      }
    )
  }
}
