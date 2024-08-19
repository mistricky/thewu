import { dependenceManager } from "./dependence-manager";
import { subscribe } from "./subscription";

type WrappedValue<T> = {
  value: undefined | T;
};

export const computed = <T>(computedFunction: () => T) => {
  const wrappedValue: WrappedValue<T> = { value: undefined };
  const id = dependenceManager.nextId;

  subscribe(() => {
    wrappedValue.value = computedFunction();
    dependenceManager.trigger(id);
  });

  return new Proxy(wrappedValue, {
    get(target, key, receiver) {
      dependenceManager.collect(id);

      return Reflect.get(target, key, receiver);
    },
  });
};
