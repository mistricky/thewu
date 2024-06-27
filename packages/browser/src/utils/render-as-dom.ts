import { WuNodeType, ParsedWuNode, WuNodeProps } from "./vdom-parser";

const setStyle = (el: HTMLElement, key: any, value: any) =>
  (el.style[key] = value);

const setClasses = (el: HTMLElement, className: string | string[]) =>
  (el.className = Array.isArray(className) ? className.join(" ") : className);

const attachAttribute = (
  { class: className, style, ...otherProps }: WuNodeProps,
  el: HTMLElement,
) => {
  if (className) {
    setClasses(el, className);
  }

  if (style) {
    Object.entries(style).forEach(([key, value]) => setStyle(el, key, value));
  }

  Object.entries(otherProps).forEach(([key, value]) =>
    el.setAttribute(key, value),
  );
};

// Render VDOM to real DOM element for browser rendering
export const renderToDOM = ({
  el,
  type,
  children,
  props,
  on,
}: ParsedWuNode): HTMLElement | Text => {
  if (type === WuNodeType.Text) {
    return el;
  }

  attachAttribute(props, el as HTMLElement);

  for (const name of Object.keys(on)) {
    (el as HTMLElement).addEventListener(name, on[name]);
  }

  for (const child of children) {
    el.appendChild(renderToDOM(child));
  }

  return el;
};
