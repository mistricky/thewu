import {
  Component,
  ComponentType,
  ParsedWuNode,
  Renderer,
  WuNode,
  getDestroyLifeCycleHookName,
  initializeNode,
} from "@thewu/core";
import { mountDOM, renderToDOM } from "./render-to-dom";
import { insert } from "../utils";

export * from "./destroy";

export class BrowserRenderer implements Renderer {
  removeNode({ componentType, el, value }: ParsedWuNode): void {
    console.info("[Action] remove node", el, value);
    if (componentType === ComponentType.CLASS_COMPONENT) {
      const instance = value as Component;

      // Trigger onDestroy life cycle hook
      instance[getDestroyLifeCycleHookName(instance)]?.();
    }

    el!.remove();
  }

  insertNode(
    node: ParsedWuNode,
    container: HTMLElement,
    position?: number | undefined,
  ): void {
    console.info("[Action] insert node", node);

    insert(renderToDOM(node, this) as any, container, position);
  }

  updateTextNodeContent(oldVDom: ParsedWuNode, newVDom: ParsedWuNode): void {
    console.info("[Action] update Text node", oldVDom, newVDom);

    if (oldVDom.value !== newVDom.value) {
      oldVDom.el!.textContent = (newVDom.value as string | undefined) ?? null;
    }
  }

  replaceWith(oldVDom: ParsedWuNode, newVDom: ParsedWuNode): void {
    console.info("[Action] replaceWith", oldVDom, newVDom);

    oldVDom.el!.replaceWith(newVDom.el!);
  }

  mount(node: WuNode, container: HTMLElement) {
    mountDOM(container, initializeNode(node, container, undefined), this);
  }
}

export const browserRenderer = new BrowserRenderer();
