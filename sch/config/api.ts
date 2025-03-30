import { Host } from "../cluster/host";
import { TASK_TYPES } from "../types/taskTypes";
import { ConfigReader } from "./reader"
import express, { NextFunction, Request, RequestHandler, Response } from 'express';

export class ConfigAPIReader extends ConfigReader {
  app: any;
  port?: number;
  endpoint?: RequestHandler;
  config: { Hosts: any[]; Tasks: any[] };


  constructor(options: { port?: number, path?: string, app?: any, endpoint?: RequestHandler, }) {
    super();
    this.path = options?.path ?? "/json/Setting";
    if (options?.app) {
      this.app = options.app;
    } else if (options?.port) {
      this.port = options.port;
      const app = express();
      this.app = app;
      app.listen(this.port, () => console.log(`Config listening to port ${this.port} !!!`))
    }
    this.endpoint = options?.endpoint;
    this.loaded = false;
    this.config = { Hosts: [], Tasks: [] };
  }

  load() {
    if (!!this.app) {
      this.app.post(this.path, this.addMiddleware);
      this.app.delete(this.path, this.removeMiddleware);
      if (!!this.endpoint?.call) this.app.post(this.path, this.endpoint);
      return true;
    }
    return false;
  }
  update() {
    this.config = { Hosts: [], Tasks: [] }; //, Jobs: []
    return true;
  }
  addMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let ans = "Config/Update:"
    // Update algorithm settings
    // req.body['Algorithms']?.forEach(alg => { });

    // Update Host settings
    req.body['Hosts']?.forEach((host: any) => {
      if (!!process.conf.hosts.some(el => el.id === host.id)) return ans += ` host ${host.id} already exists;`;
      process.conf.hosts.push(new Host(
        host.id, host.cpu, host.mem, host.net, host.transmissionDelay, host.ip
      ));
      this.config.Hosts.push(host);
      ans += ` host ${host.id} added;`
      console.log("New host added!", host);
    });

    // Update Job settings
    req.body['Tasks']?.forEach((task: any) => {
      this.config.Tasks.push(
        task.id, task.type, task.arriveTime, () => { },
        task.value, TASK_TYPES[task.type as keyof typeof TASK_TYPES].cpu, TASK_TYPES[task.type as keyof typeof TASK_TYPES].mem, TASK_TYPES[task.type as keyof typeof TASK_TYPES].net, TASK_TYPES[task.type as keyof typeof TASK_TYPES].dist,
        task.sensitive, task.isSoftDeadline, TASK_TYPES[task.type as keyof typeof TASK_TYPES].deadlineT
      )
    });
    this.loaded = true;
    if (!!this.endpoint?.call) {
      req.body.ans = ans;
      return next();
    }
    return res.json({ 'Message': ans });
  }
  removeMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let ans = "Config/Delete:"
    // Delete algorithm settings
    // req.body['Algorithms']?.forEach(alg => { });

    // Delete Host settings
    process.conf.hosts = process.conf.hosts.filter(el => {
      const flag = !!req.body['Hosts']?.some((host: any) => el.id === host.id);
      if (flag) {
        ans += ` host ${el.id} Deleted;`
        console.log("Deleted host!", el);
      }
      return !flag;
    })
    // Delete Job settings
    process.conf.tasks = process.conf.tasks.filter(el => {
      const flag = !!req.body['Tasks']?.some((task: any) => el.id === task.id);
      if (flag) {
        ans += ` task ${el.id} Deleted;`
        console.log("Deleted Task!", el);
      }
      return !flag;
    });
    if (!!this.endpoint?.call) {
      req.body.ans = ans;
      return next();
    }
    return res.json({ 'Message': ans });
  }
}
