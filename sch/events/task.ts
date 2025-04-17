import { EventEmitter } from ".";
import { TaskState } from "../cluster/task";
import { Task } from "../simulation/task";

// Event interface
export interface TaskEvent {
  type: TaskState;
  task: Task;
  timestamp: number;
}
// Global event emitter instance
export const taskEventEmitter = new EventEmitter<TaskState, TaskEvent>(); 