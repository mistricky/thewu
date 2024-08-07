import { WuNode, WuNodeType } from "../../jsx";

// Check if two nodes are equal
export const areNodesEqual = <T extends WuNode>(oldNode: T, newNode: T) => {
  if (!oldNode || !newNode) {
    return false;
  }

  // If the two node is text node both, we can reuse these nodes even
  // the value of text node is different
  if (oldNode.type === WuNodeType.TEXT && newNode.type === WuNodeType.TEXT) {
    return true;
  }

  // If the node is fragment, always return true
  if (
    oldNode.type === WuNodeType.FRAGMENT &&
    newNode.type === WuNodeType.FRAGMENT
  ) {
    return true;
  }

  // If the node is element node with different type, just return false
  // There may some edge cases, if the old node is fragment but the new node is not,
  // which means the tag of the old node is undefined, so we should check the tag to make
  // sure the tags not be undefined before comparing
  if (!!oldNode.tag && !!newNode.tag && oldNode.tag === newNode.tag) {
    return true;
  }

  return false;
};
