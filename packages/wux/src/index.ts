import { computed, WrappedValue } from "./computed";
import { DependenceManager } from "./dependence-manager";
import { TrimmedFunctionDependenceManagerParameter } from "./global";
import { reactive, ReactiveOptions } from "./reactive";
import { stream, subscribe } from "./subscription";

export * from "./reactive";
export * from "./computed";
export * from "./subscription";
export * from "./dependence-manager";

type Create = () => {
  reactive: TrimmedFunctionDependenceManagerParameter<typeof reactive>;
  computed: TrimmedFunctionDependenceManagerParameter<typeof computed>;
  subscribe: TrimmedFunctionDependenceManagerParameter<typeof subscribe>;
  stream: TrimmedFunctionDependenceManagerParameter<typeof stream>;
};

export const create: Create = () => {
  const dependenceManager = new DependenceManager();
  const withDependenceManagerOptions = { dependenceManager };

  return {
    reactive: <T extends object>(target: T, options?: ReactiveOptions) =>
      reactive(target, { ...withDependenceManagerOptions, ...options }),
    computed: <T>(computedFunction: () => T): WrappedValue<T> =>
      computed(computedFunction, withDependenceManagerOptions),
    subscribe: (watcher) => subscribe(watcher, withDependenceManagerOptions),
    stream: <R>(
      computedFunction: () => R,
      reactFunction: (params: R) => void,
    ) => stream(computedFunction, reactFunction, withDependenceManagerOptions),
  };
};
