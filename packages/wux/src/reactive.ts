import {
  dependenceManager,
  DependenceManager,
  ObserverId,
} from "./dependence-manager";
import { WithDependenceManager } from "./global";
import { getDependenceManagerFromOptions } from "./utils";

export interface ReactiveOptions {
  recursion?: boolean;
  // Assume that you have a reactive(with recursion optoion) value {v: []}.
  // When you set v to a new array, the v is not reactive anymore, so we need to
  // make the new array reactive, and trigger the original subscribed watchers when
  // the new array is modified.
  // The Dependence Manager trigger wachers by the name of the state, thus the original
  // available state name is 'v', set the `triggerStateName` to `v` to trigger these watchers
  triggerStateName?: string;
  // Dependence Manager organize watchers like:
  // {[id: ObserverId]: WatcherWithState[]}
  // If you want to trigger watchers, you need provide stateName and observerId to
  // Dependence Manager, so it can find the watchers to trigger.
  // Typically you don't need to provide observerId manually, use `createReactiveFactory` instead.
  observerId?: ObserverId;
}

export const reactive = <T extends object>(
  target: T,
  options?: WithDependenceManager<ReactiveOptions>,
): T => {
  const dependenceManager = getDependenceManagerFromOptions(options);
  const id = options?.observerId ?? dependenceManager.nextId;
  const reactiveValue = new Proxy(target, {
    set(target, key, value, receiver) {
      const parsedValue =
        isObject(value) || Array.isArray(value)
          ? reactive(value, options)
          : value;
      const setResult = Reflect.set(target, key, parsedValue, receiver);
      const isArrayLengthModifyAction =
        Array.isArray(target) && key === "length";

      if (!setResult) {
        return false;
      }

      if (!isArrayLengthModifyAction) {
        dependenceManager.trigger(
          id,
          key.toString(),
          value,
          options?.triggerStateName,
        );
      }

      return true;
    },
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);

      dependenceManager.collect(id, key.toString(), value);

      return value;
    },
  });

  return options?.recursion
    ? makeRecursionReactiveValue(target, id, options?.triggerStateName)
    : reactiveValue;
};

const isObject = (obj: unknown): obj is Record<string, unknown> =>
  Object.prototype.toString.call(obj) === "[object Object]";

const makeRecursionReactiveValue = <T extends object>(
  target: T,
  observerId?: ObserverId,
  triggerStateName?: string,
): T => {
  const value = !isObject(target)
    ? target
    : Object.keys(target).reduce((target, key) => {
        const value = target[key];
        const isArrayOrObject = Array.isArray(value) || isObject(value);

        return Object.assign(target, {
          [key]: isArrayOrObject
            ? makeRecursionReactiveValue(value, observerId, triggerStateName)
            : target,
        });
      }, target);

  return reactive(value, { observerId, triggerStateName });
};

export const createReactiveFactory = (
  targetDependenceManager?: DependenceManager,
) => {
  const parsedDependenceManager = targetDependenceManager ?? dependenceManager;
  const observerId = parsedDependenceManager.nextId;

  return <T extends object>(
    target: T,
    options?: Omit<ReactiveOptions, "observerId">,
  ) =>
    reactive(target, {
      ...options,
      observerId,
      dependenceManager: parsedDependenceManager,
    });
};
