import 'reflect-metadata';

export const PROP_KEY = Symbol('flat:prop');

export function Prop(propName: string) {
  return function(target: any, key: string) {
    Reflect.defineMetadata(PROP_KEY, propName, target, key);
  };
}
