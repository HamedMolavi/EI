// Event emitter class
export class EventEmitter<S, E extends { type: S }> {
  private listeners: Map<S, ((event: E) => void)[]> = new Map();

  // Register a listener for a specific event type
  on(eventType: S, callback: (event: E) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);
  }

  // Emit an event
  emit(event: E): void {
    const listeners = this.listeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }
}
