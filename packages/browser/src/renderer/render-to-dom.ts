import {
  WuNodeProps,
  ParsedWuNode,
  WuNodeType,
  ComponentType,
  Component,
  Renderer,
} from "@wu/core";

type RenderTarget = HTMLElement | Text;

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
    el.setAttribute(key, value as string),
  );
};

export const appendMultipleChild = (
  el: HTMLElement,
  children: RenderTarget[],
) => children.forEach((child) => el.appendChild(child));

export const mountDOM = (
  element: HTMLElement,
  node: ParsedWuNode,
  renderer: Renderer,
) => {
  const res = ([] as RenderTarget[]).concat(renderToDOM(node, renderer));

  appendMultipleChild(element, res);
};

// Render VDom to real DOM element for browser rendering
export const renderToDOM = (
  { el, type, children, props, on, value, componentType }: ParsedWuNode,
  renderer: Renderer,
): RenderTarget | RenderTarget[] => {
  if (type === WuNodeType.TEXT) {
    return el!;
  }

  if (type === WuNodeType.FRAGMENT) {
    return children.map((node) => renderToDOM(node, renderer)).flat();
  }

  attachAttribute(props, el as HTMLElement);

  for (const name of Object.keys(on)) {
    el!.addEventListener(name, on[name] as any);
  }

  for (const child of children) {
    mountDOM(el as HTMLElement, child, renderer);
  }

  // Trigger onMounted life-cycle hook
  if (componentType === ComponentType.CLASS_COMPONENT) {
    (value as Component).mount(renderer);
  }

  return el!;
};
