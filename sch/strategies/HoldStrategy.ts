import { BaseStrategy } from "./strategy";
import { Task } from "../task";
import { Host } from "../host";
import { GLOBAL_TIME } from "..";

export class HoldStrategy extends BaseStrategy {
  private holdDuration: number;
  private lastDispatchTime: number;

  constructor(holdDuration: number = 1000) { // Default hold duration of 1000ms
    super('Hold');
    this.holdDuration = holdDuration;
    this.lastDispatchTime = GLOBAL_TIME.time;
  }

  selectTaskHostMappings(sensitiveTasks: Task[], insensitiveTasks: Task[], availableHosts: Host[]): { task: Task, host: Host }[] | null {
    // First check sensitive tasks
    if (sensitiveTasks.length > 0) {
      return [{ task: sensitiveTasks[0], host: availableHosts[0] }];
    }
    // Then check insensitive tasks
    if (insensitiveTasks.length > 0) {
      return [{ task: insensitiveTasks[0], host: availableHosts[0] }];
    }
    return null;
  }


  shouldDispatch(sensitiveTasks: Task[], insensitiveTasks: Task[]): boolean {
    const timeSinceLastDispatch = GLOBAL_TIME.time - this.lastDispatchTime;

    // Always dispatch sensitive tasks immediately
    if (sensitiveTasks.length > 0) {
      this.lastDispatchTime = GLOBAL_TIME.time;
      return true;
    }

    // For insensitive tasks, check if we've waited long enough
    if (timeSinceLastDispatch >= this.holdDuration) {
      this.lastDispatchTime = GLOBAL_TIME.time;
      return true;
    }

    return false;
  }

  setHoldDuration(duration: number) {
    this.holdDuration = duration;
  }

  handleTaskStateChange(task: Task): void {
    // Send results back to User
  }
} 