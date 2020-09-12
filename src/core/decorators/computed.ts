export const COMPUTED_KEY = Symbol('flat:computed');

export function Computed() {
  return function(target: any, key: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(COMPUTED_KEY, `${key}|${Date.now()}`, target, key);
  };
}
