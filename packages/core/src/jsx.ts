import { Component } from "./component";
import { Tag, separateHandlersAndProps } from "./utils";

export enum WuNodeType {
  NODE = "node",
  FRAGMENT = "fragment",
  TEXT = "text",
  CONTAINER = "container",
}

export enum ComponentType {
  NODE,
  CLASS_COMPONENT,
  FUNCTION_COMPONENT,
}

export type WuNode = JSX.Element;

export type WuNodeValue = WuNode | string;
export type WuNodeProps = Record<string, any>;
export type Handler = EventListenerOrEventListenerObject;
export type Handlers = Record<string, Handler>;
export type FunctionComponent = (...args: any[]) => JSX.Element | null;
export type ClassComponent = new (...args: any[]) => any;

export const withDefaultWuNode = <T extends object>(
  node?: Partial<T>,
  props?: WuNodeProps,
): T => {
  const { attrs, handlers } = separateHandlersAndProps(props ?? {});
  const DEFAULT_NODE: WuNode = {
    tag: undefined,
    type: WuNodeType.NODE,
    props: attrs,
    children: [],
    on: handlers,
    componentType: ComponentType.NODE,
  };

  return { ...DEFAULT_NODE, ...(node ?? {}) } as T;
};

declare global {
  namespace JSX {
    // interface IntrinsicElements extends ReactJSX.IntrinsicElements {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    type Element = {
      props: WuNodeProps;
      tag: Tag;
      children: (WuNode | string)[];
      // The el will be set after the element is rendered
      el?: HTMLElement | Text;
      on: Handlers;
      type: WuNodeType;
      value?: string | Function | Component;
      componentType: ComponentType;
    };
  }
}
