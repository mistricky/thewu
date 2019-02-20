export function compose(...func: Function[]) {
  return func.reduce((preFunc, currentFunc) => (...args: unknown[]) =>
    preFunc(currentFunc(args))
  );
}
