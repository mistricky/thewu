import { Component } from "../component";
import { ParsedWuNode } from "../initialize";
import { WuNode } from "../jsx";

interface Stringable {
  toString(): string;
}

export type ComponentWithInstance = { instance: any } & Component;
type Constructor<T = any> = new (...args: any[]) => T;

export type Tag = string | Function | undefined | Component;

export const isClass = <T extends Stringable>(target: T): boolean =>
  target.toString().startsWith("class");

export const isWuNode = (tag: Tag): tag is string => typeof tag === "string";

export const isFunctionComponent = (tag: Tag): tag is Function =>
  typeof tag === "function";

export const isInvalidWuNode = (target: WuNode) =>
  !target.tag && !target.children && !target.type;

export const isClassComponent = (tag: Tag): tag is Component =>
  isFunctionComponent(tag) && isClass(tag ?? "");

export const isEventHandler = (attrName: string) => attrName.startsWith("on");

export const getActuallyEventHandlerName = (rawAttrName: string) =>
  rawAttrName.slice(2).toLowerCase();

export const isHTMLElement = (el: ParsedWuNode["el"]): el is HTMLElement =>
  typeof el !== "string" && el !== undefined;

export const isObject = (obj: unknown): obj is Record<string, unknown> =>
  Object.prototype.toString.call(obj) === "[object Object]";
