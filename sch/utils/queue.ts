export class Evented {
  listeners: { [key: string]: Function[] };

  constructor() {
    this.listeners = {};
  }

  on(eventType: string, callback: Function) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  off(eventType: string, callback: Function) {
    if (this.listeners[eventType]) {
      const index = this.listeners[eventType].indexOf(callback);
      if (index !== -1) {
        this.listeners[eventType].splice(index, 1);
      }
    }
  }

  _triggerEvent(eventName: string, ...args: any[]) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(...args));
    }
  }

}