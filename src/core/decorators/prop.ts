import "reflect-metadata";
import { markProp } from "./@mark-prop";

export const PROP_KEY = Symbol("flat:prop");

export function Prop() {
  return function(target: any, key: string) {
    markProp(target, key, PROP_KEY);
  };
}
