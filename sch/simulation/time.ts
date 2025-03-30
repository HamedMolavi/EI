export class Time {
  private _value: number = 0;
  private listeners: ((newValue: number) => void)[] = [];

  get value(): number {
    return this._value;
  }

  set value(newValue: number) {
    if (this._value !== newValue) {
      console.log('----', newValue);
      this._value = newValue;
      this.notifyListeners(newValue);
    }
  }

  onChange(callback: (newValue: number) => void): void {
    this.listeners.push(callback);
  }

  private notifyListeners(newValue: number): void {
    this.listeners.forEach(callback => callback(newValue));
  }
}

