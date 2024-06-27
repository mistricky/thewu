import { WuNode } from "@wu/core";
import { getPropsWithoutChildren } from "./vdom";

export enum WuNodeType {
  Text,
  Node,
}

export type WuNodeValue = ParsedWuNode | string;
export type WuNodeProps = Record<string, any>;
export type RenderTarget = WuNode;
export type ParsedWuNode<T = HTMLElement | Text> = {
  children: ParsedWuNode[];
  el: T;
  on: Handlers;
  type: WuNodeType;
  value?: WuNodeValue;
  props: WuNodeProps;
};
export type Handler = (...args: any[]) => void;
export type Handlers = Record<string, Handler>;

const isWuNode = (target: RenderTarget) => typeof target.type !== "function";

const isEventHandler = (attrName: string) => attrName.startsWith("on");

const getActuallyEventHandlerName = (rawAttrName: string) =>
  rawAttrName.slice(2).toLowerCase();

const parseProps = (props: Record<string, any>) =>
  Object.keys(props).reduce(
    (total, key) => {
      const result = isEventHandler(key)
        ? {
            handlers: {
              [getActuallyEventHandlerName(key)]: props[key],
              ...total.handlers,
            },
          }
        : { attrs: { [key]: props[key], ...total.attrs } };

      return {
        ...total,
        ...result,
      };
    },
    { attrs: {}, handlers: {} },
  );

const parseVDom = (
  el: HTMLElement | Text,
  type: WuNodeType,
  value?: WuNodeValue,
  props: WuNodeProps | undefined = {},
  handlers: Handlers | undefined = {},
  children: ParsedWuNode[] | undefined = [],
): ParsedWuNode => ({
  type,
  value,
  el,
  props,
  on: handlers,
  children,
});

// Prepare VDom, create real DOM element and set it on the `el` of VDom
// but not to draw into the browser.
// Set the reference of event handlers on the `on` field of VDom
export const prepare = (target: WuNode): ParsedWuNode => {
  if (["string", "number"].includes(typeof target)) {
    return parseVDom(
      document.createTextNode(target.toString()),
      WuNodeType.Text,
      target.toString(),
    );
  }

  if (isWuNode(target)) {
    return parseWuNode(target);
  }

  return parseFunctionNode(target);
};

const parseFunctionNode = (node: WuNode) => {
  const props = getPropsWithoutChildren(node.props);

  return prepare(node.type(props));
};

const parseWuNode = (node: WuNode): ParsedWuNode => {
  const domElement: HTMLElement = document.createElement(node.type);
  const props = getPropsWithoutChildren(node.props);
  const { attrs, handlers } = parseProps(props);

  const parsedChildren = node.props.children.map((child: WuNode) =>
    prepare(child),
  );

  return parseVDom(
    domElement,
    WuNodeType.Node,
    undefined,
    attrs,
    handlers,
    parsedChildren,
  );
};
