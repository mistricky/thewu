import { ParsedWuNode, TransformedNode } from "../../initialize";
import { WuNode, WuNodeType } from "../../jsx";
import { Renderer } from "../../renderer";
import { areNodesEqual } from "./equal";
import { patchChildren } from "./patch-element/patch-children";
import { patchElementNode } from "./patch-element/patch-element";

const isTextNode = (vdom: ParsedWuNode) => vdom.type === WuNodeType.TEXT;

export const patch = (
  oldVDom: ParsedWuNode,
  newVDom: ParsedWuNode,
  renderer: Renderer,
) => {
  // If two nodes of vdom are not equal, we destroy original node and
  // create new node to replace it
  if (!areNodesEqual(oldVDom, newVDom)) {
    return renderer.replaceWith(oldVDom, newVDom);
  }

  // If the value of vdom is not undefined, the node must be text node
  // If two nodes of vdom are text node, we just update the value of text node
  if (isTextNode(oldVDom)) {
    renderer.updateTextNodeContent(oldVDom, newVDom);

    newVDom.el = oldVDom.el;
    return;
  }

  // Patch fragment
  if (oldVDom.type === WuNodeType.FRAGMENT) {
    return patchChildren(
      oldVDom.parentEl,
      oldVDom.children,
      newVDom.children,
      renderer,
    );
  }

  // Patch element node
  patchElementNode(oldVDom, newVDom, renderer);
};
