import { TaskState } from "../cluster/task";
import { Task } from "./task";

// Event interface
export interface TaskEvent {
  type: TaskState;
  task: Task;
  timestamp: number;
}

// Event emitter class
export class EventEmitter {
  private listeners: Map<TaskState, ((event: TaskEvent) => void)[]> = new Map();

  // Register a listener for a specific event type
  on(eventType: TaskState, callback: (event: TaskEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Emit an event
  emit(event: TaskEvent): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }
}

// Global event emitter instance
export const taskEventEmitter = new EventEmitter(); 