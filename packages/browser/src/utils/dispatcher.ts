import { omit } from "./pure";

export type DispatcherListener = (payload: any) => void;

type Callback = () => void;

export type Reducer<T> = Record<string, (state: T, payload?: any) => T>;

export class Dispatcher {
  private listeners: Record<string, DispatcherListener> = {};
  private callbacks: Callback[] = [];

  private runCallbacks() {
    for (const callback of this.callbacks) {
      callback();
    }
  }

  on(eventName: string, handler: DispatcherListener): typeof this.remove {
    this.listeners[eventName] = handler;

    return () => this.remove(eventName);
  }

  remove(eventName: string) {
    this.listeners = omit(this.listeners, eventName);
  }

  run(callback: Callback) {
    this.callbacks.push(callback);
  }

  emit = (eventName: string, payload?: any) => {
    const listener = this.listeners[eventName];

    if (!listener) {
      throw new Error(
        `Cannot find corresponding listener which event name is ${eventName}`,
      );
    }

    listener(payload);
    this.runCallbacks();
  };
}
