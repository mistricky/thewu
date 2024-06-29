import { ParsedWuNode, Renderer, WuNode, initializeNode } from "@wu/core";
import { mountDOM } from "./render-to-dom";
import { insert } from "../utils";

export * from "./destroy";

export class BrowserRenderer implements Renderer {
  removeNode(node: ParsedWuNode): void {
    node.el!.remove();
  }

  insertNode(
    node: ParsedWuNode,
    container: HTMLElement,
    position?: number | undefined,
  ): void {
    insert(node.el!, container, position);
  }

  updateTextNodeContent(oldVDom: ParsedWuNode, newVDom: ParsedWuNode): void {
    if (oldVDom.value !== newVDom.value) {
      oldVDom.el!.textContent = (newVDom.value as string | undefined) ?? null;
    }
  }

  replaceWith(oldVDom: ParsedWuNode, newVDom: ParsedWuNode): void {
    oldVDom.el!.replaceWith(newVDom.el!);
  }

  mount(node: WuNode, container: HTMLElement) {
    mountDOM(container, initializeNode(node, container), this);
  }
}

export const browserRenderer = new BrowserRenderer();
