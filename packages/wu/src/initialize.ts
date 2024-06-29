import { Component } from "./component";
import { ComponentType, WuNode, WuNodeType, withDefaultWuNode } from "./jsx";
import { isWuNode } from "./utils";

export type ParsedWuNode = Omit<WuNode, "children" | "el"> & {
  // When the node is fragment, el is equal to undefined
  el: HTMLElement | Text | undefined;
  children: ParsedWuNode[];
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

  return {
    ...node,
    children: node.children.map((child) => transformNode(child)),
  };
};

// Create real DOM element for vdom node, and set it to the `el` field of vdom node
export const parseNode = (
  node: TransformedNode,
  parentEl: HTMLElement,
): ParsedWuNode => {
  const createNode = (
    el: HTMLElement | Text | undefined,
    children: ParsedWuNode[] | undefined = [],
  ) => ({
    ...node,
    children,
    el,
    parentEl,
  });

  if (node.type === WuNodeType.TEXT) {
    return createNode(document.createTextNode(node.value as string));
  }

  const el = isWuNode(node.tag) ? document.createElement(node.tag) : undefined;
  const parsedNode = createNode(
    el,
    // If the el is undefined that indicates the node is fragment, so the parentEl of
    // children should be the same as the parentEl of the fragment node
    node.children.map((child) => parseNode(child, el ?? parentEl)),
  );

  if (node.componentType === ComponentType.CLASS_COMPONENT) {
    (node.value as Component).init(parsedNode);
  }

  return parsedNode;
};

export const initializeNode = (node: WuNode, parentEl: HTMLElement) =>
  parseNode(transformNode(node), parentEl);
