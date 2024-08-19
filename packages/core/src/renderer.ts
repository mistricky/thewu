import { ParsedWuNode, TransformedNode } from "./initialize";
import { WuNode } from "./jsx";

export interface Renderer {
  // If two nodes of vdom are not equal, we destroy original node and
  // create new node to replace it
  replaceWith(oldVDom: ParsedWuNode, newVDom: WuNode): void;

  // Render node directly to real DOM, and set the real DOM element to the `el`
  mount(node: TransformedNode, container: unknown): void;

  // If two nodes of vdom are text node, we just update the value of text node
  updateTextNodeContent(oldVDom: ParsedWuNode, newVDom: WuNode): void;

  // Insert node to container at specific position
  insertNode(
    node: TransformedNode,
    container: HTMLElement,
    position?: number,
  ): void;

  // Remove the node from view
  removeNode(node: ParsedWuNode): void;
}
