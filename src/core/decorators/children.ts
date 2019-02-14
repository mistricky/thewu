import "reflect-metadata";

export const CHILDREN_KEY = Symbol("flat:children");

export function Children() {
  return function(target: any, key: string) {
    Reflect.defineMetadata(CHILDREN_KEY, key, target);
  };
}
