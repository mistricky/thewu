import { Handler, Handlers, ParsedWuNode, WuNodeType } from "../utils";

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

// Remove DOM element from document but don't care about vdom
export const destroy = ({ el, type, children, on }: ParsedWuNode) => {
  el.remove();
  removeListeners(el, on);

  if (type === WuNodeType.Text) {
    return;
  }

  for (const child of children) {
    destroy(child);
  }
};
