// import { markProp } from './@mark-prop';

export const STATE_KEY = Symbol('flat:state');

export function State() {
  return function(target: any, key: string) {
    // markProp(target, key, STATE_KEY);
    Reflect.defineMetadata(STATE_KEY, `${key}|${Date.now()}`, target, key);
  };
}
