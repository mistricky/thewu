import {
  dependenceManager,
  DependenceManager,
  ObserverId,
} from "./dependence-manager";
import { WithDependenceManager } from "./global";
import { getDependenceManagerFromOptions } from "./utils";

export interface ReactiveOptions {
  recursion?: boolean;
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
      const setResult = Reflect.set(target, key, value, receiver);
      const isArrayLengthModifyAction =
        Array.isArray(target) && key === "length";

      if (!setResult) {
        return false;
      }

      if (!isArrayLengthModifyAction) {
        dependenceManager.trigger(id, key.toString(), value);
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
    ? makeRecursionReactiveValue(target, id)
    : reactiveValue;
};

const isObject = (obj: unknown): obj is Record<string, unknown> =>
  Object.prototype.toString.call(obj) === "[object Object]";

const makeRecursionReactiveValue = <T extends object>(
  target: T,
  observerId?: ObserverId,
): T => {
  const value = !isObject(target)
    ? target
    : Object.keys(target).reduce((target, key) => {
        const value = target[key];
        const isArrayOrObject = Array.isArray(value) || isObject(value);

        return Object.assign(target, {
          [key]: isArrayOrObject
            ? makeRecursionReactiveValue(value, observerId)
            : target,
        });
      }, target);

  return reactive(value, { observerId });
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
