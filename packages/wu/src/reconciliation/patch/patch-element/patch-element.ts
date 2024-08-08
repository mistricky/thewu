import { ParsedWuNode, TransformedNode } from "../../../initialize";
import { WuNode } from "../../../jsx";
import { Renderer } from "../../../renderer";
import { isHTMLElement } from "../../../utils";
import { patchAttrs } from "./patch-attrs";
import { patchChildren } from "./patch-children";
import { patchEventListeners } from "./patch-event-handlers";
import { patchStyle } from "./patch-style";

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
  patchEventListeners(oldVDom.el, oldVDom.on, newVDom.on);
  // @TODO patch event listener

  patchChildren(oldVDom.el, oldVDom.children, newVDom.children, renderer);
};
