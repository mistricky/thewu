import { ParsedWuNode } from "../../../initialize";
import { Renderer } from "../../../renderer";
import { isHTMLElement } from "../../../utils";
import { patchAttrs } from "./patch-attrs";
import { patchChildren } from "./patch-children";

// Patch something like element node not text node
export const patchElementNode = (
  oldVDom: ParsedWuNode,
  newVDom: ParsedWuNode,
  renderer: Renderer,
) => {
  if (!isHTMLElement(oldVDom.el) || !isHTMLElement(newVDom.el)) {
    return;
  }

  const { props: oldProps } = oldVDom;
  const { props: newProps } = newVDom;

  patchAttrs(oldVDom.el, oldProps, newProps);
  // patchStyle(oldVDom.el, oldVDom.el.style, newVDom.el.style);

  // The handler function is different during each render, so the diff
  // will always return false, and then replace the old handler with new.
  // This is not the correct way to handle event listeners.
  // comment this line temporarily
  // patchEventListeners(oldVDom.el, oldVDom.on, newVDom.on);

  patchChildren(oldVDom.el, oldVDom.children, newVDom.children, renderer);
};
