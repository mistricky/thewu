import { Handler, Handlers, ParsedWuNode, WuNodeType } from "@wu/core";

const removeListener = (
  el: HTMLElement | Text,
  name: string,
  listener: Handler,
) => el.removeEventListener(name, listener);

const removeListeners = (el: HTMLElement | Text, listeners: Handlers) => {
  Object.entries(listeners).forEach(([name, handler]) => {
    removeListener(el, name, handler);
  });
};

const destroyChildren = (children: ParsedWuNode["children"]) => {
  for (const child of children) {
    destroy(child);
  }
};

// Remove DOM element from document but don't care about vdom
export const destroy = ({ el, type, children, on }: ParsedWuNode) => {
  if (!el) {
    destroyChildren(children);
    return;
  }

  el.remove();
  removeListeners(el, on);

  if (type === WuNodeType.TEXT) {
    return;
  }

  destroyChildren(children);
};
