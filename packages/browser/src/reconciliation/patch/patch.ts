import { ParsedWuNode, WuNodeType } from "../../utils/vdom-parser";
import { areNodesEqual } from "./equal";
import { patchElementNode } from "./patch-element/patch-element";

const isTextNode = (vdom: ParsedWuNode): vdom is ParsedWuNode<Text> =>
  vdom.type === WuNodeType.Text;

export const patch = (oldVDom: ParsedWuNode, newVDom: ParsedWuNode) => {
  // If two nodes of vdom are not equal, we destroy original node and
  // create new node to replace it
  if (!areNodesEqual(oldVDom, newVDom)) {
    oldVDom.el.replaceWith(newVDom.el);
    return;
  }

  // If the value of vdom is not undefined, the node must be text node
  // If two nodes of vdom are text node, we just update the value of text node
  if (isTextNode(oldVDom)) {
    if (oldVDom.value !== newVDom.value) {
      oldVDom.el.textContent = (newVDom.value as string | undefined) ?? null;
    }

    newVDom.el = oldVDom.el;
    return;
  }

  // @TODO: patch fragment

  // Patch element node
  patchElementNode(
    oldVDom as ParsedWuNode<HTMLElement>,
    newVDom as ParsedWuNode<HTMLElement>,
  );
};
