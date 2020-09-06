export const COMPUTED_KEY = Symbol('flat:computed');

export function Computed() {
  return function(target: any, key: string) {
    console.info(target);
    // markProp(target, key, STATE_KEY);
    Reflect.defineMetadata(COMPUTED_KEY, `${key}|${Date.now()}`, target, key);
  };
}
