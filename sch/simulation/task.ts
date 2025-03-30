import { BaseTask } from "../cluster/task";
import { Random } from "random";
const random = new Random();



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
}