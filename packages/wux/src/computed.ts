import { WithDependenceManager } from "./global";
import { getDependenceManagerFromOptions, isEmptyObject } from "./utils";

export type WrappedValue<T> = {
  value: undefined | T;
};

export const computed = <T>(
  computedFunction: () => T,
  options?: WithDependenceManager<{}>
): WrappedValue<T> => {
  const dependenceManager = getDependenceManagerFromOptions(options);
  const wrappedValue: WrappedValue<() => T> = { value: computedFunction };
  let states = {};
  let previousData = undefined;

  return new Proxy(wrappedValue, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);

      if (key === "value") {
        // State was updated
        if (!isEmptyObject(states)) {
          const result = Object.keys(dependenceManager.states).reduce(
            (result, key) =>
              states[key] === dependenceManager.states[key] && result,
            true
          );

          if (result) {
            return previousData;
          }
        }

        const parsedValue = value();

        previousData = parsedValue;

        // When the computed function first call, keep the states reference
        if (isEmptyObject(states)) {
          states = dependenceManager.states;
        }

        return parsedValue;
      }

      return key === "value" ? value() : value;
    },
    set() {
      throw new Error("Cannot set value of computed value");
    },
  }) as WrappedValue<T>;
};
