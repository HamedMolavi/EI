import { Host } from "../cluster/host";
import { Task } from "../cluster/task";
import { TASK_TYPES } from "../types/taskTypes";
import { ConfigAPIReader } from "./api";
import { ConfigFileReader } from "./file";





export class Config {
  hosts: Host[];
  fileReader?: ConfigFileReader;
  apiReader?: ConfigAPIReader
  tasks: Task[];
  startTime: number;
  constructor(options: { filePath?: string, apiPath?: string, app?: any, port?: number }) {
    this.startTime = Date.now();
    this.hosts = [];
    this.tasks = [];
    this.fileReader = undefined;
    this.apiReader = undefined;
    this.init(options)
  }

  init(options: { filePath?: string, apiPath?: string, app?: any, port?: number }) {
    // read config from file
    try {
      this.fileReader = new ConfigFileReader({ path: options?.filePath });
      if (!this.fileReader.load()) console.error("Reading config from file was not successful!");
      else {
        this.fileReader.config?.Hosts?.forEach((host) => this.hosts.push(new Host(
          host.id, host.mem, host.net, host.cpu, host.transmissionDelay, host.ip
        )))
        if (process.env["SCH_MODE"]?.toLowerCase() === "offline") this.fileReader?.config?.Tasks?.forEach(task => this.tasks.push(new Task(
          task.id, task.type, task.arriveTime, () => { },
          task.value, TASK_TYPES[task.type as keyof typeof TASK_TYPES].cpu, TASK_TYPES[task.type as keyof typeof TASK_TYPES].mem, TASK_TYPES[task.type as keyof typeof TASK_TYPES].net, TASK_TYPES[task.type as keyof typeof TASK_TYPES].dist,
          task.sensitive, task.isSoftDeadline, TASK_TYPES[task.type as keyof typeof TASK_TYPES].deadlineT
        )))
      }
    } catch (error) {
      console.error("Reading config from file was not successful!");
      console.error(error)
    }
    // run config reader from api
    try {
      this.apiReader = new ConfigAPIReader({ path: options?.apiPath, app: options?.app, port: options?.port });
      if (!this.apiReader.load()) console.error("Reading config from API was not successful!");
      else {
        this.apiReader?.config?.Hosts?.forEach((host) => this.hosts.push(new Host(
          host.id, host.mem, host.net, host.cpu, host.transmissionDelay, host.ip
        )))
        // this.apiReader?.config?.Jobs?.forEach((job) => this.jobs.push(new K8Job(job)))
      }
    } catch (error) {
      console.error("Reading config from API was not successful!");
      console.error(error)
    }

  }
  toJSON() { return { hosts: this.hosts, tasks: this.tasks, file: this.fileReader?.loaded, api: this.apiReader?.loaded } }
}
