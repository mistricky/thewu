export const omit = <T extends object, K extends keyof T>(
  target: T,
  removeKey: K,
): Omit<T, K> =>
  Object.keys(target).reduce(
    (total, key) =>
      key === removeKey ? total : { ...total, [key]: target[key as K] },
    {} as Omit<T, K>,
  );
