import { Component } from "../component";

interface Stringable {
  toString(): string;
}

export type ComponentWithInstance = { instance: any } & Component;
type Constructor<T = any> = new (...args: any[]) => T;

export type Tag = string | Function | undefined | ComponentWithInstance;

export const isClass = <T extends Stringable>(target: T): boolean =>
  target.toString().startsWith("class");

export const isWuNode = (tag: Tag): tag is string => typeof tag === "string";

export const isFunctionComponent = (tag: Tag): tag is Function =>
  typeof tag === "function";

export const isClassComponent = (
  tag: Tag,
): tag is Constructor & { $instance: any } =>
  isFunctionComponent(tag) && isClass(tag ?? "");

export const isEventHandler = (attrName: string) => attrName.startsWith("on");

export const getActuallyEventHandlerName = (rawAttrName: string) =>
  rawAttrName.slice(2).toLowerCase();
