import { ParsedWuNode, WuNodeType } from "../../utils/vdom-parser";

// Check if two nodes are equal
export const areNodesEqual = (oldNode: ParsedWuNode, newNode: ParsedWuNode) => {
  // If the two node is text node both, we can reuse these nodes even
  // the value of text node is different
  if (oldNode.type === WuNodeType.Text && newNode.type === WuNodeType.Text) {
    return true;
  }

  // @TODO: compare fragment

  // If the node is element node with different type, just return false
  if (oldNode.el.nodeName === newNode.el.nodeName) {
    return true;
  }

  return false;
};
