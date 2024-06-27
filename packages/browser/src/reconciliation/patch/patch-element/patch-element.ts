import { ParsedWuNode } from "../../../utils";
import { patchAttrs } from "./patch-attrs";
import { patchChildren } from "./patch-children";
import { patchStyle } from "./patch-style";

// Patch something like element node not text node
export const patchElementNode = (
  oldVdom: ParsedWuNode<HTMLElement>,
  newVdom: ParsedWuNode<HTMLElement>,
) => {
  const { props: oldProps } = oldVdom;
  const { props: newProps } = newVdom;

  // oldVdom.el.className = newVdom.el.className;
  // patchAttrs(oldVdom.el, oldProps, newProps);
  // patchStyle(oldVdom.el, oldVdom.el.style, newVdom.el.style);

  // @TODO patch event listener

  patchChildren(oldVdom.el, oldVdom.children, newVdom.children);
};
