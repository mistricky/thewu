import { Component } from "./component";
import {
  isClassComponent,
  isFunctionComponent,
  separateHandlersAndProps,
  Tag,
} from "./utils";

export type WuNode = JSX.Element;

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

export const createElement = (
  tag: Tag,
  props?: Record<string, any>,
  ...children: JSX.Element[]
) => {
  // console.info(tag, "ttttt");

  const parsedProps = props ?? {};
  const createWuNodeByJSXElement = (node: Partial<WuNode> | undefined = {}) =>
    withDefaultWuNode({ children, tag, ...node }, parsedProps);

  if (isClassComponent(tag)) {
    // Set instance to the class component as static property
    // to avoid reconstruct class component instance
    if (!tag.$instance) {
      tag.$instance = new tag({ props: parsedProps });
    }

    tag.$instance.updateProps(parsedProps);

    const vdom = tag.$instance.render();

    return createWuNodeByJSXElement({
      value: tag.$instance,
      ...vdom,
      componentType: ComponentType.CLASS_COMPONENT,
    });
  }

  // If the node is fragment or functional component
  if (isFunctionComponent(tag)) {
    const vdom = tag(parsedProps);

    return !Object.keys(vdom).length
      ? // If the vdom is fragment
        createWuNodeByJSXElement({ type: WuNodeType.FRAGMENT })
      : createWuNodeByJSXElement({
          ...vdom,
          value: tag,
          componenType: ComponentType.FUNCTION_COMPONENT,
        });
  }

  return createWuNodeByJSXElement();
};

export const createFragment = (children: JSX.Element[]) => children;
