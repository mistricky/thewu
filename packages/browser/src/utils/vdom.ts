export const getPropsWithoutChildren = <T extends Record<string, unknown>>(
  props: T,
): Omit<T, "children"> =>
  Object.keys(props).reduce<T>((pre, cur) => {
    return cur !== "children" ? { [cur]: props[cur], ...pre } : pre;
  }, {} as T);
