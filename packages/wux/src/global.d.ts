export type WithDependenceManager<T extends object> = T & {
  dependenceManager?: DependenceManager;
};

export type TrimmedDependenceManager<T extends WithDependenceManager<{}>> =
  Omit<T, "dependenceManager">;

export type TrimmedDependenceManagerFromParameters<T extends any[]> =
  T extends [infer P, ...infer R]
    ? P extends Record<any, any>
      ? P extends WithDependenceManager<{}>
        ? keyof TrimmedDependenceManager<P> extends never
          ? TrimmedDependenceManagerFromParameters<R>
          : [
              TrimmedDependenceManager<P>,
              ...TrimmedDependenceManagerFromParameters<R>,
            ]
        : [P, ...TrimmedDependenceManagerFromParameters<R>]
      : P extends DependenceManager
        ? TrimmedDependenceManagerFromParameters<R>
        : [P, ...TrimmedDependenceManagerFromParameters<R>]
    : T;

export type TrimmedFunctionDependenceManagerParameter<
  T extends (...args: any[]) => any,
> = (
  ...args: TrimmedDependenceManagerFromParameters<Parameters<T>>
) => ReturnType<T>;
