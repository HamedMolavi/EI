class Evented {
  constructor() {
    this.listeners = {};
  }

  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  off(eventType, callback) {
    if (this.listeners[eventType]) {
      const index = this.listeners[eventType].indexOf(callback);
      if (index !== -1) {
        this.listeners[eventType].splice(index, 1);
      }
    }
  }

  _triggerEvent(eventName, ...args) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(callback => callback(...args));
    }
  }

}


module.exports = {
  Evented
}