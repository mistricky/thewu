import { Watcher } from "./dependence-manager";
import { WithDependenceManager } from "./global";
import { getDependenceManagerFromOptions } from "./utils";
import { isEqual, cloneDeep } from "lodash";

export const subscribe = (
  watcher: Watcher,
  options?: WithDependenceManager<{}>,
) => {
  const dependenceManager = getDependenceManagerFromOptions(options);

  dependenceManager.addWatcher(watcher);
  watcher();
  dependenceManager.clearWatchers();
};

const withPreviousValue = <R, T>(fn: (param?: T) => R) => {
  let previousValue: R | undefined = undefined;

  return (param?: T) => {
    const currentValue = fn(param);
    const parsedPreviousValue = previousValue ?? currentValue;

    previousValue = cloneDeep(currentValue);

    return {
      previousValue: parsedPreviousValue,
      currentValue,
    };
  };
};

interface StreamOptions<R> {
  // Compare the previous value with the current value, if it returns true
  // the reactFunction will not be called
  compare?: (a: R, b: R) => boolean;
}

// Same as subscribe but it will call the reactFunction only if the return value of computedFunction has changed
export const stream = <R>(
  computedFunction: () => R,
  reactFunction: (params: R) => void,
  options?: WithDependenceManager<StreamOptions<R>>,
) => {
  const dependenceManager = getDependenceManagerFromOptions(options);
  const computedFunctionWithPreviousValue = withPreviousValue(computedFunction);
  const compare = options?.compare ?? ((a: R, b: R) => a === b);

  dependenceManager.addWatcher(() => {
    const { previousValue, currentValue } = computedFunctionWithPreviousValue();

    if (compare(previousValue, currentValue)) {
      return;
    }

    reactFunction(currentValue);
  });

  computedFunctionWithPreviousValue();

  dependenceManager.clearWatchers();
};

export const watch = (
  lazyStates: () => unknown[],
  reactFunction: () => void,
  options?: WithDependenceManager<{}>,
) =>
  stream(lazyStates, reactFunction, {
    ...options,
    compare: (a, b) => isEqual(a, b),
  });
