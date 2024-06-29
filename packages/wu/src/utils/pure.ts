interface Stringable {
  toString(): string;
}

type Constructor<T = any> = new (...args: any[]) => T;
export type Tag = string | Function | undefined;

export const isClass = <T extends Stringable>(target: T): boolean =>
  target.toString().startsWith("class");

export const isWuNode = (tag: Tag): tag is string => typeof tag === "string";

export const isFunctionComponent = (tag: Tag): tag is Function =>
  typeof tag === "function";

export const isClassComponent = (tag: Tag): tag is Constructor =>
  isFunctionComponent(tag) && isClass(tag ?? "");

export const isEventHandler = (attrName: string) => attrName.startsWith("on");

export const getActuallyEventHandlerName = (rawAttrName: string) =>
  rawAttrName.slice(2).toLowerCase();
