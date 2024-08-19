import { Component } from "./component";
import { ComponentType, WuNode, WuNodeType, withDefaultWuNode } from "./jsx";
import { isInvalidWuNode, isWuNode } from "./utils";

export type ParsedWuNode = Omit<WuNode, "children" | "el"> & {
  // When the node is fragment, el is equal to undefined
  el: HTMLElement | Text | undefined;
  children: ParsedWuNode[];
  parentNode: ParsedWuNode | undefined;
  parentEl: HTMLElement;
};

export type TransformedNode = Omit<WuNode, "children"> & {
  children: TransformedNode[];
};

export const transformNode = (
  node: WuNode | string | undefined | null,
): TransformedNode => {
  if (node === undefined || node === null) {
    return withDefaultWuNode<TransformedNode>({
      type: WuNodeType.TEXT,
      value: String(node),
    });
  }

  if (typeof node === "string" || typeof node === "number") {
    return withDefaultWuNode({
      type: WuNodeType.TEXT,
      value: node.toString(),
    }) as ParsedWuNode;
  }

  if (Array.isArray(node)) {
    return withDefaultWuNode<TransformedNode>({
      type: WuNodeType.FRAGMENT,
      children: node.map(transformNode),
    });
  }

  if (isInvalidWuNode(node)) {
    return withDefaultWuNode({
      type: WuNodeType.TEXT,
      value: Object.prototype.toString.call(node),
    }) as ParsedWuNode;
  }

  return {
    ...node,
    children: node.children.map(transformNode),
  };
};

// Create real DOM element for vdom node, and set it to the `el` field of vdom node
export const parseNode = (
  node: TransformedNode,
  parentEl: HTMLElement,
  parentNode: ParsedWuNode | undefined,
): ParsedWuNode => {
  const createNode = (
    el: HTMLElement | Text | undefined,
    children: ParsedWuNode[] | undefined = [],
  ): ParsedWuNode => ({
    ...node,
    children,
    el,
    parentNode,
    parentEl,
  });

  if (node.type === WuNodeType.TEXT) {
    return createNode(document.createTextNode(node.value as string));
  }

  const el = isWuNode(node.tag) ? document.createElement(node.tag) : undefined;
  const parsedNode = createNode(el, []) as ParsedWuNode;
  const isFragment = node.type === WuNodeType.FRAGMENT;

  parsedNode.children = node.children.map((child) =>
    // If the el is undefined that indicates the node is fragment, so the parentEl of
    // children should be the same as the parentEl of the fragment node
    parseNode(child, el ?? parentEl, isFragment ? parentNode : parsedNode),
  );

  if (node.componentType === ComponentType.CLASS_COMPONENT) {
    (node.value as Component).initVdom(parsedNode);
  }

  return parsedNode;
};

export const initializeNode = (
  node: WuNode,
  parentEl: HTMLElement,
  parentNode: ParsedWuNode | undefined,
) => parseNode(transformNode(node), parentEl, parentNode);
