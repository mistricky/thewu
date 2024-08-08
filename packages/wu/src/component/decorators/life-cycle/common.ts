const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

type LifeCycleHook<N extends string> = {
  [K in `on${Capitalize<N>}`]: (target: any, propertyKey: string) => void;
} & {
  [K in `get${Capitalize<N>}LifeCycleHookName`]: (target: any) => string;
};

export const createLifeCycleHook = <N extends string>(
  name: N,
  metadataKey: symbol,
): LifeCycleHook<N> => {
  const capitalizedHookName = capitalize(name);
  const decoratorName = `on${capitalizedHookName}`;
  const getLifeCycleHookNameName = `get${capitalizedHookName}LifeCycleHookName`;

  return {
    [decoratorName]: (target: any, propertyKey: string) => {
      Reflect.defineMetadata(metadataKey, propertyKey, target);
    },
    [getLifeCycleHookNameName]: (target: any) =>
      Reflect.getMetadata(metadataKey, target),
  } as LifeCycleHook<N>;
};
