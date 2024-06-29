import { ParsedWuNode, TransformedNode } from "../../../initialize";
import { WuNode } from "../../../jsx";
import { Renderer } from "../../../renderer";
import { patchAttrs } from "./patch-attrs";
import { patchChildren } from "./patch-children";
import { patchStyle } from "./patch-style";

// Patch something like element node not text node
export const patchElementNode = (
  oldVDom: ParsedWuNode,
  newVDom: ParsedWuNode,
  renderer: Renderer,
) => {
  const { props: oldProps } = oldVDom;
  const { props: newProps } = newVDom;

  // oldVdom.el.className = newVdom.el.className;
  patchAttrs(oldVDom.el as any, oldProps, newProps);
  // patchStyle(oldVdom.el, oldVdom.el.style, newVdom.el.style);

  // @TODO patch event listener

  patchChildren(
    oldVDom.el as HTMLElement,
    oldVDom.children,
    newVDom.children,
    renderer,
  );
};
